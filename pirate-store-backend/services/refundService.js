const Refund = require('../models/Refund');
const Order = require('../models/Order');

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

const processRefund = async (refundId) => {
  const refund = await Refund.findById(refundId);

  if (!refund) return;

  if (refund.retryCount >= 3) return;

  try {
    const success = Math.random() > 0.3;

    if (!success) throw new Error('Payment failed');

    refund.status = 'success';
    refund.processedAt = new Date();

    await refund.save();

    // ✅ ربط مع order فقط (بدون تغيير status)
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

      setTimeout(() => {
        processRefund(refund._id);
      }, 5000);
    } else {
    await Order.findByIdAndUpdate(refund.order, {
    refundStatus: 'failed'
   });
    }
  }
};

module.exports = {
  createRefund,
};