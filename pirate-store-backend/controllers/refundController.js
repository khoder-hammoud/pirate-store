// controllers/refundController.js
const refundService = require('../services/refundServiceFull');
const { handleRefundError } = require('../middleware/errorHandlerUtil');

/**
 * Initiate Refund - POST /api/refunds/orders/:id
 * @access Private
 */
const initiateRefund = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate refund request
    await refundService.validateRefundRequest(
      orderId,
      amount,
      userId,
      userRole
    );

    // Create refund
    const refund = await refundService.createRefund({
      orderId,
      userId,
      amount
    });

    res.status(201).json({
      message: 'Refund initiated successfully',
      refund
    });
  } catch (error) {
    console.error('Initiate Refund Error:', error);
    const { status, message } = handleRefundError(error);
    res.status(status).json({ message });
  }
};

/**
 * Get Refund by Order ID - GET /api/refunds/orders/:id
 * @access Private
 */
const getRefundByOrderId = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const refund = await refundService.getRefundByOrderId(orderId, req.user);
    res.status(200).json(refund);
  } catch (error) {
    console.error('Get Refund Error:', error);
    const { status, message } = handleRefundError(error);
    res.status(status).json({ message });
  }
};

/**
 * Get All Refunds - GET /api/refunds
 * @access Private (Admin Only)
 */
const getAllRefunds = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const refunds = await refundService.getAllRefunds();

    res.status(200).json({
      count: refunds.length,
      refunds
    });
  } catch (error) {
    console.error('Get All Refunds Error:', error);
    res.status(500).json({
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Get Refund Statistics - GET /api/refunds/stats
 * @access Private (Admin Only)
 */
const getRefundStats = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const stats = await refundService.getRefundStats();

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get Refund Stats Error:', error);
    res.status(500).json({
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
};
