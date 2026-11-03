const { prisma } = require('../config/db.prisma');
const AppError = require('../utils/AppError');
const { canTransition } = require('../utils/orderStateRules');
const { createRefund } = require('./refundService.prisma');
const { buildPrismaQuery, buildPaginationMeta } = require('../utils/prismaQuery');

/**
 * Validate order items and calculate price
 */
const validateAndCalculateOrder = async (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    throw new AppError('Order items are required', 400);
  }

  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    // ✅ PRISMA: استخدام prisma.product.findUnique
    const product = await prisma.product.findUnique({
      where: { id: item.productId } // تأكد أن المفتاح يطابق الـ schema
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.countInStock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product: ${product.name}`,
        400
      );
    }

    validatedItems.push({
      productId: product.id,
      quantity: item.quantity,
      name: product.name,
      price: product.price,
      image: product.image
    });

    itemsPrice += product.price * item.quantity;
  }

  const taxRate = 0.15;
  const shippingPrice = 10;
  const discountRate = 0;

  const taxAmount = +(itemsPrice * taxRate).toFixed(2);
  const discountAmount = +(itemsPrice * discountRate).toFixed(2);

  const totalPrice = +(
    itemsPrice +
    taxAmount +
    shippingPrice -
    discountAmount
  ).toFixed(2);

  return {
    orderItems: validatedItems,
    itemsPrice,
    taxAmount,
    shippingPrice,
    discountAmount,
    totalPrice
  };
};

/**
 * Create a new order
 */
const createOrder = async (userId, orderData) => {
  const { orderItems, shippingAddress } = orderData;

  if (!shippingAddress) {
    throw new AppError('Shipping address is required', 400);
  }

  const priceData = await validateAndCalculateOrder(orderItems);

  // ✅ PRISMA: استخدام prisma.order.create
  const order = await prisma.order.create({
    data: {
      userId,
      orderItems: priceData.orderItems,
      shippingAddress,
      itemsPrice: priceData.itemsPrice,
      taxAmount: priceData.taxAmount,
      shippingPrice: priceData.shippingPrice,
      discountAmount: priceData.discountAmount,
      totalPrice: priceData.totalPrice,
      status: 'pending',
      isPaid: false,
      isDelivered: false,
      invoiceNumber: `INV-${Date.now()}`
    }
  });

  return order;
};

/**
 * Get user's orders
 */
const getUserOrders = async (userId, query = {}) => {
  const requestQuery = query || {};
  const page = Number(requestQuery.page) || 1;
  const limit = Number(requestQuery.limit) || 10;

  const queryOptions = buildPrismaQuery({
    query: requestQuery,
    page,
    limit,
    sort: requestQuery.sort,
    sortBy: requestQuery.sortBy,
    sortOrder: requestQuery.sortOrder,
    filters: {
      userId,
      isDeleted: false
    },
    select: requestQuery.fields
  });

  const [orders, total] = await Promise.all([
    prisma.order.findMany(queryOptions),
    prisma.order.count({
      where: queryOptions.where
    })
  ]);

  return {
    items: orders,
    ...buildPaginationMeta({
      total,
      page,
      limit
    })
  };
};

/**
 * Get order by ID with authorization check
 */
const getOrderById = async (orderId, user) => {
  // ✅ PRISMA: استخدام prisma.order.findUnique
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== user.id && user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  return order;
};

/**
 * Delete order (soft delete - admin only)
 */
const deleteOrder = async (orderId) => {
  // ✅ PRISMA: استخدام prisma.order.findUnique ثم update
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  // ✅ PRISMA: استخدام prisma.order.update
  const deletedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  return deletedOrder;
};

/**
 * Mark order as paid with atomic stock update
 */
const updateOrderToPaid = async (orderId, user) => {
  // ✅ PRISMA: استخدام prisma.$transaction للـ atomic operation
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.isDeleted) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== user.id && user.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    if (order.isPaid) {
      throw new AppError('Order already paid', 400);
    }

    if (!canTransition(order.status, 'paid')) {
      throw new AppError('Invalid status transition', 400);
    }

    // Update stock for each item
    for (const item of order.orderItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || product.countInStock < item.quantity) {
        throw new AppError('Insufficient stock', 400);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          countInStock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: 'paid'
      }
    });

    return updatedOrder;
  });
};

/**
 * Mark order as delivered
 */
const updateOrderToDelivered = async (orderId, user) => {
  // ✅ PRISMA: استخدام prisma.order.findUnique
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  if (user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  if (!order.isPaid) {
    throw new AppError('Order is not paid yet', 400);
  }

  if (order.isDelivered) {
    throw new AppError('Order already delivered', 400);
  }

  if (!canTransition(order.status, 'delivered')) {
    throw new AppError('Invalid status transition', 400);
  }

  // ✅ PRISMA: استخدام prisma.order.update
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isDelivered: true,
      deliveredAt: new Date(),
      status: 'delivered'
    }
  });

  return updatedOrder;
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, user) => {
  // ✅ PRISMA: استخدام prisma.$transaction
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.isDeleted) {
      throw new AppError('Order not found', 404);
    }

    const isOwner = order.userId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Order already cancelled', 400);
    }

    if (isOwner && !isAdmin) {
      const diffMinutes = (Date.now() - order.createdAt.getTime()) / (1000 * 60);

      if (diffMinutes > 15) {
        throw new AppError('Cancel window expired', 400);
      }

      if (!canTransition(order.status, 'cancelled')) {
        throw new AppError('Invalid status transition', 400);
      }
    }

    // Restore stock for cancelled order
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          countInStock: {
            increment: item.quantity
          }
        }
      });
    }

    // Update order status
    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    // Trigger refund if order was paid
    if (order.isPaid) {
      try {
        const refund = await createRefund({
          orderId: order.id,
          userId: user.id,
          amount: order.totalPrice
        });

        await tx.order.update({
          where: { id: orderId },
          data: {
            refundId: refund.id,
            refundStatus: 'pending'
          }
        });
      } catch (err) {
        console.error('Refund failed:', err.message);
      }
    }

    return cancelledOrder;
  });
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  validateAndCalculateOrder
};
