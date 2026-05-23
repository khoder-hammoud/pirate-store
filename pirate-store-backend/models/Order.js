const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },        // Snapshot
        price: { type: Number, required: true },       // Snapshot
        quantity: { type: Number, required: true },
        image: { type: String, required: true },       // Snapshot
      },
    ],

    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },

    // Payment & Pricing
    itemsPrice: { type: Number, required: true },
    taxRate: { type: Number },         // Optional للعرض
    taxAmount: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    discountRate: { type: Number },    // Optional للعرض
    discountAmount: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // Status & Timestamps
    status: {
      type: String,
      enum: ["pending","paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    refund: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund',
        default: null
      },
      refundStatus: {
  type: String,
  enum: ['none', 'pending', 'success', 'failed'],
  default: 'none'
},


    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  // Soft Delete Fields 
    isDeleted: {
  type: Boolean,
  default: false,
},
deletedAt: {
  type: Date,
},



  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;