const express = require('express');
const router = express.Router();

const {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
} = require('../controllers/refundController');

const { protect, admin } = require('../middleware/authMiddleware');

/**
 * User Routes
 */

// Initiate Refund for an Order
// POST /api/refunds/orders/:id
router.post('/orders/:id', protect, initiateRefund);

// Get Refund by Order ID
// GET /api/refunds/orders/:id
router.get('/orders/:id', protect, getRefundByOrderId);

/**
 * Admin Routes
 */

// Get All Refunds (Admin Only)
// GET /api/refunds
router.get('/', protect, admin, getAllRefunds);

// Get Refund Statistics (Admin Only)
// GET /api/refunds/stats
router.get('/stats', protect, admin, getRefundStats);

module.exports = router;
