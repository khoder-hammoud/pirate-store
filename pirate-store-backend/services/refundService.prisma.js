const { prisma } = require('../config/db.prisma');
const AppError = require('../utils/AppError');
const { buildPrismaQuery, buildPaginationMeta } = require('../utils/prismaQuery');

/**
 * Create Refund
 */
const createRefund = async ({ orderId, userId, amount }) => {
  // ✅ PRISMA: استخدام prisma.refund.create
  const refund = await prisma.refund.create({
    data: {
      orderId,
      userId,
      amount,
      status: 'pending'
    }
  });

  // Process refund asynchronously
  setImmediate(() => {
    processRefund(refund.id);
  });

  return refund;
};

/**
 * Process Refund with retry logic
 */
const processRefund = async (refundId) => {
  // ✅ PRISMA: استخدام prisma.refund.findUnique
  const refund = await prisma.refund.findUnique({
    where: { id: refundId }
  });

  if (!refund) return;
  if (refund.retryCount >= 3) return;

  try {
    const success = Math.random() > 0.3;

    if (!success) {
      throw new Error('Payment failed');
    }

    // ✅ PRISMA: استخدام prisma.refund.update
    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'success',
        processedAt: new Date()
      }
    });

    // ✅ PRISMA: استخدام prisma.order.update
    await prisma.order.update({
      where: { id: refund.orderId },
      data: {
        refundId: refund.id,
        refundStatus: 'success'
      }
    });

  } catch (error) {
    // ✅ PRISMA: استخدام prisma.refund.update مع increment
    const retryCount = refund.retryCount + 1;

    if (retryCount < 3) {
      await prisma.refund.update({
        where: { id: refundId },
        data: {
          retryCount: {
            increment: 1
          },
          status: 'pending',
          failureReason: error.message
        }
      });

      // Retry after 5 seconds
      setTimeout(() => {
        processRefund(refundId);
      }, 5000);
    } else {
      // ✅ PRISMA: استخدام prisma.refund.update
      await prisma.refund.update({
        where: { id: refundId },
        data: {
          retryCount: {
            increment: 1
          },
          failureReason: error.message
        }
      });

      // ✅ PRISMA: استخدام prisma.order.update
      await prisma.order.update({
        where: { id: refund.orderId },
        data: {
          refundStatus: 'failed'
        }
      });
    }
  }
};

/**
 * Get refund by order ID
 */
const getRefundByOrderId = async (orderId, user) => {
  // ✅ PRISMA: استخدام prisma.order.findUnique
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== user.id && user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  // ✅ PRISMA: استخدام prisma.refund.findFirst مع include
  const refund = await prisma.refund.findFirst({
    where: { orderId },
    include: {
      order: true,
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!refund) {
    throw new AppError('No refund found for this order', 404);
  }

  return refund;
};

/**
 * Get all refunds (Admin only)
 */
const getAllRefunds = async (query = {}) => {
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
    search: requestQuery.keyword || requestQuery.search,
    searchFields: ['failureReason'],
    include: {
      order: true,
      user: {
        select: { name: true, email: true }
      }
    }
  });

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany(queryOptions),
    prisma.refund.count({
      where: queryOptions.where
    })
  ]);

  return {
    ...buildPaginationMeta({
      total,
      page,
      limit
    }),
    items: refunds
  };
};

/**
 * Get refund statistics
 */
const getRefundStats = async () => {
  // ✅ PRISMA: استخدام prisma.refund.groupBy (بدل aggregate)
  const stats = await prisma.refund.groupBy({
    by: ['status'],
    _count: {
      id: true
    },
    _sum: {
      amount: true
    }
  });

  const summary = {
    totalRefundRequests: 0,
    successfulRefunds: 0,
    failedRefunds: 0,
    pendingRefunds: 0,
    totalRefundedAmount: 0
  };

  stats.forEach(stat => {
    summary.totalRefundRequests += stat._count.id;
    summary.totalRefundedAmount += (stat._sum.amount || 0);

    if (stat.status === 'success') {
      summary.successfulRefunds = stat._count.id;
    } else if (stat.status === 'failed') {
      summary.failedRefunds = stat._count.id;
    } else if (stat.status === 'pending') {
      summary.pendingRefunds = stat._count.id;
    }
  });

  return summary;
};

/**
 * Validate refund request
 */
const validateRefundRequest = async (orderId, amount, userId, userRole) => {
  if (!amount || amount <= 0) {
    throw new AppError('Amount must be a positive number', 400);
  }

  // ✅ PRISMA: استخدام prisma.order.findUnique
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.isDeleted) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== userId && userRole !== 'admin') {
    throw new AppError('Not authorized to refund this order', 403);
  }

  if (!order.isPaid) {
    throw new AppError('Order is not paid yet', 400);
  }

  if (amount > order.totalPrice) {
    throw new AppError('Refund amount exceeds order total', 400);
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
