// services/refundServiceFull.js
const Refund = require('../models/Refund');
const Order = require('../models/Order');

/**
 * Create Refund
 */
const createRefund = async ({ orderId, userId, amount }) => {
  const refund = await Refund.create({
    order: orderId,
    user: userId,
    amount,
    status: 'pending'
  });

  setImmediate(() => {
    processRefund(refund._id);
  });

  return refund;
};

/**
 * Process Refund with retry logic
 */
const processRefund = async (refundId) => {
  const refund = await Refund.findById(refundId);

  if (!refund) return;

  if (refund.retryCount >= 3) return;

  try {
    const success = Math.random() > 0.3; // 70% success rate

    if (!success) throw new Error('Payment failed');

    refund.status = 'success';
    refund.processedAt = new Date();

    await refund.save();

    // Link with order
    await Order.findByIdAndUpdate(refund.order, {
      refund: refund._id,
      refundStatus: 'success'
    });

  } catch (error) {
    refund.retryCount += 1;
    refund.failureReason = error.message;

    if (refund.retryCount < 3) {
      refund.status = 'pending';
      await refund.save();

      // Retry after 5 seconds
      setTimeout(() => {
        processRefund(refund._id);
      }, 5000);
    } else {
      // Mark as failed after 3 retries
      await Order.findByIdAndUpdate(refund.order, {
        refundStatus: 'failed'
      });
    }
  }
};

/**
 * Get refund by order ID
 */
const getRefundByOrderId = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new Error('Not authorized');
  }

  const refund = await Refund.findOne({ order: orderId })
    .populate('order')
    .populate('user', 'name email');

  if (!refund) {
    throw new Error('No refund found for this order');
  }

  return refund;
};

/**
 * Get all refunds (Admin only)
 */
const getAllRefunds = async () => {
  return await Refund.find()
    .populate('order')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get refund statistics (Admin only)
 */
const getRefundStats = async () => {
  const stats = await Refund.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const summary = {
    totalRefundRequests: 0,
    successfulRefunds: 0,
    failedRefunds: 0,
    pendingRefunds: 0,
    totalRefundedAmount: 0
  };

  stats.forEach(stat => {
    summary.totalRefundRequests += stat.count;
    summary.totalRefundedAmount += stat.totalAmount;

    if (stat._id === 'success') {
      summary.successfulRefunds = stat.count;
    } else if (stat._id === 'failed') {
      summary.failedRefunds = stat.count;
    } else if (stat._id === 'pending') {
      summary.pendingRefunds = stat.count;
    }
  });

  return summary;
};

/**
 * Validate refund request
 */
const validateRefundRequest = async (orderId, amount, userId, userRole) => {
  // Validate amount
  if (!amount || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new Error('Not authorized to refund this order');
  }

  // Check if order is paid
  if (!order.isPaid) {
    throw new Error('Order is not paid yet');
  }

  // Check if refund amount exceeds order total
  if (amount > order.totalPrice) {
    throw new Error(`Refund amount cannot exceed order total: ${order.totalPrice}`);
  }

  // Check if refund already exists
  const existingRefund = await Refund.findOne({
    order: orderId,
    status: { $in: ['pending', 'success'] }
  });

  if (existingRefund) {
    throw new Error('Refund already exists for this order');
  }

  return order;
};

module.exports = {
  createRefund,
  processRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats,
  validateRefundRequest
};
