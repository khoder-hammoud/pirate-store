// services/orderService.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { canTransition } = require('../utils/orderStateRules');
const { createRefund } = require('./refundServiceFull');

/**
 * Validate order items and calculate price
 */
const validateAndCalculateOrder = async (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    throw new Error('Order items are required');
  }

  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.countInStock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    validatedItems.push({
      ...item,
      name: product.name,
      price: product.price,
      image: product.image
    });

    itemsPrice += product.price * item.quantity;
  }

  // Calculate taxes and fees
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
    throw new Error('Shipping address is required');
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
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    order.user.toString() !== user._id.toString() &&
    user.role !== 'admin'
  ) {
    throw new Error('Not authorized');
  }

  return order;
};

/**
 * Delete order (soft delete - admin only)
 */
const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order || order.isDeleted) {
    throw new Error('Order not found');
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

    // Validate order exists
    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    // Check authorization
    if (
      order.user.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      throw new Error('Not authorized');
    }

    // Check if already paid
    if (order.isPaid) {
      throw new Error('Order already paid');
    }

    // Check state transition
    if (!canTransition(order.status, 'paid')) {
      throw new Error('Invalid status transition');
    }

    // Atomically update stock
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
        throw new Error('Insufficient stock');
      }
    }

    // Update order
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
 * Mark order as delivered (admin only)
 */
const updateOrderToDelivered = async (orderId, user) => {
  const order = await Order.findById(orderId);

  // Validate order exists
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // Check admin role
  if (user.role !== 'admin') {
    throw new Error('Not authorized');
  }

  // Check if order is paid
  if (!order.isPaid) {
    throw new Error('Order is not paid yet');
  }

  // Check if already delivered
  if (order.isDelivered) {
    throw new Error('Order already delivered');
  }

  // Check state transition
  if (!canTransition(order.status, 'delivered')) {
    throw new Error('Invalid status transition');
  }

  // Update order
  order.isDelivered = true;
  order.deliveredAt = new Date();
  order.status = 'delivered';

  await order.save();

  return order;
};

/**
 * Cancel order (user within 15 minutes)
 */
const cancelOrder = async (orderId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Not authorized');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order already cancelled');
    }

    // Check cancel window (15 minutes for users)
    if (isOwner && !isAdmin) {
      const diffMinutes = (Date.now() - order.createdAt) / (1000 * 60);

      if (diffMinutes > 15) {
        throw new Error('Cancel window expired');
      }

      if (!canTransition(order.status, 'cancelled')) {
        throw new Error('Invalid status transition');
      }
    }

    // Restore stock
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

    // Process refund if order was paid
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