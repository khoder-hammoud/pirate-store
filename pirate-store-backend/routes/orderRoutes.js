const express = require("express");
const asyncWrapper = require("../utils/asyncWrapper");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder
} = require("../controllers/OrderController");

const { protect, admin } = require("../middleware/authMiddleware");
const { validateOrderCreation, validateObjectId } = require('../middleware/validators/orderValidator');

// Create Order
router.post(
  "/",
  asyncWrapper(protect),
  asyncWrapper(validateOrderCreation),
  asyncWrapper(createOrder)
);

// Get My Orders
router.get(
  "/myorders",
  asyncWrapper(protect),
  asyncWrapper(getUserOrders)
);

// GET /:id  and DELETE /:id
router.route('/:id')
  .get(
    asyncWrapper(protect),
    asyncWrapper(validateObjectId),
    asyncWrapper(getOrderById)
  )
  .delete(
    asyncWrapper(protect),
    asyncWrapper(admin),
    asyncWrapper(validateObjectId),
    asyncWrapper(deleteOrder)
  );

// Mark as Paid
router.put(
  '/:id/pay',
  asyncWrapper(protect),
  asyncWrapper(validateObjectId),
  asyncWrapper(updateOrderToPaid)
);

// Mark as Delivered (Admin Only)
router.put(
  '/:id/deliver',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(validateObjectId),
  asyncWrapper(updateOrderToDelivered)
);

// Cancel Order
router.put(
  '/:id/cancel',
  asyncWrapper(protect),
  asyncWrapper(validateObjectId),
  asyncWrapper(cancelOrder)
);

module.exports = router;