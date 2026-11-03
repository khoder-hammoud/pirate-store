// controllers/orderController.js

const orderService = require('../services/orderService');
const AppError = require('../utils/AppError');

const createOrder = async (req, res, next) => {
  const order = await orderService.createOrder(req.user._id, req.body);

  if (!order) {
    return next(new AppError('Order creation failed', 400));
  }

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
};

const getUserOrders = async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);

  res.status(200).json(orders);
};

const getOrderById = async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id, req.user);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json(order);
};

const deleteOrder = async (req, res) => {
  await orderService.deleteOrder(req.params.id);

  res.status(200).json({
    message: 'Order soft deleted successfully'
  });
};

const updateOrderToPaid = async (req, res, next) => {
  const order = await orderService.updateOrderToPaid(req.params.id, req.user);

  if (!order) {
    return next(new AppError('Payment failed', 400));
  }

  res.status(200).json({
    message: 'Order paid and stock updated successfully',
    order
  });
};

const updateOrderToDelivered = async (req, res, next) => {
  const order = await orderService.updateOrderToDelivered(
    req.params.id,
    req.user
  );

  if (!order) {
    return next(new AppError('Delivery update failed', 400));
  }

  res.status(200).json({
    message: 'Order marked as delivered',
    order
  });
};

const cancelOrder = async (req, res, next) => {
  const order = await orderService.cancelOrder(req.params.id, req.user);

  if (!order) {
    return next(new AppError('Cancel order failed', 400));
  }

  res.status(200).json({
    message: 'Order cancelled successfully',
    order
  });
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder
};