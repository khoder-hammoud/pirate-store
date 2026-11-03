const refundService = require('../services/refundServiceFull');
const AppError = require('../utils/AppError');

/**
 * Initiate Refund
 */
const initiateRefund = async (req, res, next) => {
  const { id: orderId } = req.params;
  const { amount } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  const refund = await refundService.validateAndCreateRefund(
    orderId,
    amount,
    userId,
    userRole
  );

  res.status(201).json({
    message: 'Refund initiated successfully',
    refund
  });
};

/**
 * Get Refund by Order ID
 */
const getRefundByOrderId = async (req, res, next) => {
  const { id: orderId } = req.params;

  const refund = await refundService.getRefundByOrderId(orderId, req.user);

  if (!refund) {
    return next(new AppError('Refund not found', 404));
  }

  res.status(200).json(refund);
};

/**
 * Get All Refunds (Admin)
 */
const getAllRefunds = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const refunds = await refundService.getAllRefunds();

  res.status(200).json({
    count: refunds.length,
    refunds
  });
};

/**
 * Get Refund Stats (Admin)
 */
const getRefundStats = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const stats = await refundService.getRefundStats();

  res.status(200).json(stats);
};

module.exports = {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
};