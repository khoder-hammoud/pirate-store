const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { canTransition } = require('../utils/orderStateRules');
const { createRefund } = require('./refundServiceFull');

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
    const product = await Product.findById(item.product);

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
      ...item,
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

  const order = await Order.create({
    user: userId,
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
  });

  return order;
};

/**
 * Get user's orders
 */
const getUserOrders = async (userId) => {
  return await Order.find({ user: userId, isDeleted: false }).sort({
    createdAt: -1
  });
};

/**
 * Get order by ID with authorization check
 */
const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  if (
    order.user.toString() !== user._id.toString() &&
    user.role !== 'admin'
  ) {
    throw new AppError('Not authorized', 403);
  }

  return order;
};

/**
 * Delete order (soft delete - admin only)
 */
const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  order.isDeleted = true;
  order.deletedAt = new Date();

  await order.save();

  return order;
};

/**
 * Mark order as paid with atomic stock update
 */
const updateOrderToPaid = async (orderId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order || order.isDeleted) {
      throw new AppError('Order not found', 404);
    }

    if (
      order.user.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      throw new AppError('Not authorized', 403);
    }

    if (order.isPaid) {
      throw new AppError('Order already paid', 400);
    }

    if (!canTransition(order.status, 'paid')) {
      throw new AppError('Invalid status transition', 400);
    }

    for (const item of order.orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          countInStock: { $gte: item.quantity }
        },
        {
          $inc: { countInStock: -item.quantity }
        },
        { session }
      );

      if (result.modifiedCount === 0) {
        throw new AppError('Insufficient stock', 400);
      }
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'paid';

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Mark order as delivered
 */
const updateOrderToDelivered = async (orderId, user) => {
  const order = await Order.findById(orderId);

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

  order.isDelivered = true;
  order.deliveredAt = new Date();
  order.status = 'delivered';

  await order.save();

  return order;
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order || order.isDeleted) {
      throw new AppError('Order not found', 404);
    }

    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('Not authorized', 403);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Order already cancelled', 400);
    }

    if (isOwner && !isAdmin) {
      const diffMinutes = (Date.now() - order.createdAt) / (1000 * 60);

      if (diffMinutes > 15) {
        throw new AppError('Cancel window expired', 400);
      }

      if (!canTransition(order.status, 'cancelled')) {
        throw new AppError('Invalid status transition', 400);
      }
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } },
        { session }
      );
    }

    order.status = 'cancelled';
    order.isDeleted = true;
    order.deletedAt = new Date();

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    if (order.isPaid) {
      try {
        const refund = await createRefund({
          orderId: order._id,
          userId: user._id,
          amount: order.totalPrice
        });

        order.refund = refund._id;
        order.refundStatus = 'pending';

        await order.save();
      } catch (err) {
        console.error('Refund failed:', err.message);
      }
    }

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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