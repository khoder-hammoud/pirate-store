const express = require("express");
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

// Create Order
router.post("/", protect, createOrder);

// Get My Orders
router.get("/myorders", protect, getUserOrders);

// Get Order By ID
router.get("/:id", protect, getOrderById);

// Soft Delete (Admin Only)
router.delete("/:id", protect, admin, deleteOrder);

// Mark as Paid
router.put("/:id/pay", protect, updateOrderToPaid);

// Mark as Delivered (Admin Only)
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);

// Cancel Order
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;