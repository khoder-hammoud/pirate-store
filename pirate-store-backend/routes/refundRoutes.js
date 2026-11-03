const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const router = express.Router();

const {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
} = require('../controllers/refundController');

const { protect, admin } = require('../middleware/authMiddleware');
const { validateRefundInitiation, validateObjectId } = require('../middleware/validators/refundValidator');

/**
 * User Routes
 */

// POST /api/refunds/orders/:id  -> initiate or get refund by order
router.route('/orders/:id')
  .post(
    asyncWrapper(protect),
    asyncWrapper(validateObjectId),
    asyncWrapper(validateRefundInitiation),
    asyncWrapper(initiateRefund)
  )
  .get(
    asyncWrapper(protect),
    asyncWrapper(validateObjectId),
    asyncWrapper(getRefundByOrderId)
  );

/**
 * Admin Routes
 */

// GET /api/refunds
router.get(
  '/',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(getAllRefunds)
);

// GET /api/refunds/stats
router.get(
  '/stats',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(getRefundStats)
);

module.exports = router;
