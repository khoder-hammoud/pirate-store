// models/Refund.js

const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    // 🔗 ربط مع الطلب
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },

    // 👤 مين طلب الاسترجاع (اختياري بس مهم)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // 💰 المبلغ
    amount: {
      type: Number,
      required: true
    },

    // 📊 حالة الاسترجاع
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true
    },

    // 🔁 عدد المحاولات
    retryCount: {
      type: Number,
      default: 0
    },

    // ❌ سبب الفشل (إذا فشل)
    failureReason: {
      type: String
    },

    // 🧾 معرف العملية من مزود الدفع (Stripe مثلاً)
    externalTransactionId: {
      type: String
    },

    // ⏱️ تواريخ مهمة
    requestedAt: {
      type: Date,
      default: Date.now
    },

    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Refund', refundSchema);