// controllers/orderController.js
const orderService = require('../services/orderService');
const { handleOrderError } = require('../middleware/errorHandlerUtil');

/**
 * Create Order - POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get My Orders - GET /api/orders/myorders
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Get Order By ID - GET /api/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.status(200).json(order);
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Delete Order (Soft Delete) - DELETE /api/orders/:id
 * @access Private (Admin)
 */
const deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(200).json({ message: 'Order soft deleted successfully' });
  } catch (error) {
    console.error('Soft Delete Order Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Mark Order as Paid - PUT /api/orders/:id/pay
 * @access Private
 */
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await orderService.updateOrderToPaid(req.params.id, req.user);
    res.status(200).json({
      message: 'Order paid and stock updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Order To Paid Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Mark Order as Delivered - PUT /api/orders/:id/deliver
 * @access Private (Admin)
 */
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await orderService.updateOrderToDelivered(
      req.params.id,
      req.user
    );
    res.status(200).json({
      message: 'Order marked as delivered',
      order
    });
  } catch (error) {
    console.error('Update Order To Delivered Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Cancel Order - PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user);
    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
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