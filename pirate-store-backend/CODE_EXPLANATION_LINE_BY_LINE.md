# 📖 شرح الكود سطر بسطر - للمذاكرة مع ChatGPT

**ملاحظة:** هذا الملف يشرح كل سطر بالتفصيل لتسهيل فهمك عند مشاركته مع ChatGPT أو معلمك

---

## 🎯 البنية الكاملة للمشروع

### المجلدات الرئيسية:
```
pirate-store-backend/
├── controllers/     ← استقبال الطلبات والرد
├── services/        ← كل اللوجيك والعمليات
├── models/          ← قاعدة البيانات
├── routes/          ← توجيه الطلبات
└── middleware/      ← الفحوصات الأساسية
```

---

## 🔄 تدفق الطلب (Request Flow) - مهم جداً!

```
1. User يوكل API
   ↓
2. Route توجه الطلب
   ↓
3. Middleware تفحص التوكن
   ↓
4. Controller تستقبل
   ↓
5. Service تعالج اللوجيك
   ↓
6. Model تتحدث مع Database
   ↓
7. Service ترجع النتيجة
   ↓
8. Controller ترسل Response
   ↓
9. User يستقبل JSON
```

---

## 📋 شرح الملفات الأساسية

### 1️⃣ ROUTES (التوجيه)

**ملف:** `routes/orderRoutes.js`

```javascript
// استيراد Express
const express = require("express");
const router = express.Router();

// استيراد الدوال من Controller
const {
  createOrder,           // دالة إنشاء أوردر
  getUserOrders,         // دالة جلب أوردراتي
  getOrderById,          // دالة جلب أوردر واحد
  updateOrderToPaid,     // دالة تحديث الدفع
  updateOrderToDelivered,// دالة التوصيل
  cancelOrder            // دالة الإلغاء
} = require("../controllers/OrderController");

// استيراد الوسيطات (Middleware)
const { protect, admin } = require("../middleware/authMiddleware");

// ====== التوجيهات ======

// POST /api/orders - إنشاء أوردر
// protect: يفحص التوكن
// createOrder: الدالة اللي تعالج الطلب
router.post("/", protect, createOrder);

// GET /api/orders/myorders - جلب أوردراتي
router.get("/myorders", protect, getUserOrders);

// GET /api/orders/:id - جلب أوردر واحد
// :id يعني معامل متغير (مثل 6505abc123)
router.get("/:id", protect, getOrderById);

// DELETE /api/orders/:id - حذف أوردر
// admin: وسيطة إضافية تفحص هل هو Admin بس
router.delete("/:id", protect, admin, deleteOrder);

// PUT /api/orders/:id/pay - دفع الأوردر
router.put("/:id/pay", protect, updateOrderToPaid);

// PUT /api/orders/:id/deliver - توصيل الأوردر
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);

// PUT /api/orders/:id/cancel - إلغاء الأوردر
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
```

**الفائدة من هذا الملف:**
- ✅ توجيه الطلبات للـ Controller الصحيح
- ✅ وضع الـ middleware في المكان الصحيح
- ✅ تحديد HTTP method (GET, POST, PUT, DELETE)

---

### 2️⃣ CONTROLLER (معالج الطلب)

**ملف:** `controllers/OrderController.js`

```javascript
// استيراد Service (اللوجيك)
const orderService = require('../services/orderService');

/**
 * Create Order - POST /api/orders
 * @access Private (يحتاج توكن)
 * 
 * الشرح:
 * - req.body: البيانات اللي جاية من العميل
 * - req.user: المستخدم من التوكن (أضافه الـ middleware)
 * - res: الاستجابة اللي برسلها للعميل
 */
const createOrder = async (req, res) => {
  try {
    // استدعاء الدالة من Service
    // نمرر:
    // - req.user._id: معرف المستخدم
    // - req.body: البيانات (orderItems, shippingAddress)
    const order = await orderService.createOrder(
      req.user._id,  // المستخدم
      req.body       // البيانات
    );

    // إرسال Response
    // 201: Created (تم إنشاء مورد جديد)
    // order: البيانات المرجعة
    res.status(201).json(order);

  } catch (error) {
    // إذا حصل خطأ
    // 400: Bad Request (الطلب خاطئ)
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get User Orders - GET /api/orders/myorders
 * @access Private
 * 
 * الشرح:
 * - جلب أوردرات المستخدم الحالي فقط
 */
const getUserOrders = async (req, res) => {
  try {
    // استدعاء Service
    const orders = await orderService.getUserOrders(req.user._id);

    // إرسال النتيجة
    res.status(200).json(orders);

  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Get Order By ID - GET /api/orders/:id
 * @access Private
 * 
 * الشرح:
 * - جلب أوردر واحد مع فحص الملكية
 * - فقط صاحب الأوردر أو Admin يقدر يشوفه
 */
const getOrderById = async (req, res) => {
  try {
    // req.params.id: المعرف من الـ URL (مثل /api/orders/6505abc123)
    const order = await orderService.getOrderById(
      req.params.id,  // معرف الأوردر
      req.user        // بيانات المستخدم الحالي
    );

    res.status(200).json(order);

  } catch (error) {
    console.error('Get Order By ID Error:', error);

    // معالجة أنواع الأخطاء المختلفة
    if (error.message === 'Not authorized') {
      // 403: Forbidden (ممنوع)
      return res.status(403).json({ message: error.message });
    }

    if (error.message === 'Order not found') {
      // 404: Not Found (غير موجود)
      return res.status(404).json({ message: error.message });
    }

    // 500: Server Error (خطأ في السيرفر)
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Mark Order as Paid - PUT /api/orders/:id/pay
 * @access Private
 * 
 * الشرح:
 * - تحديث الأوردر إلى مدفوع
 * - إنقاص المخزون بشكل آمن
 */
const updateOrderToPaid = async (req, res) => {
  try {
    // استدعاء Service مع معرف الأوردر وبيانات المستخدم
    const order = await orderService.updateOrderToPaid(
      req.params.id,  // معرف الأوردر
      req.user        // المستخدم
    );

    res.status(200).json({
      message: 'Order paid and stock updated successfully',
      order
    });

  } catch (error) {
    console.error('Update Order To Paid Error:', error);

    // معالجة أخطاء مختلفة
    if (error.message === 'Not authorized') {
      return res.status(403).json({ message: error.message });
    }

    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }

    // أخطاء تتعلق بالبيانات
    if (error.message.includes('already paid') ||
        error.message.includes('Invalid status') ||
        error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel Order - PUT /api/orders/:id/cancel
 * @access Private
 * 
 * الشرح:
 * - إلغاء الأوردر في خلال 15 دقيقة
 * - استرجاع المخزون
 * - إنشاء Refund إذا كان مدفوع
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.id,  // معرف الأوردر
      req.user        // المستخدم
    );

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Cancel Order Error:', error);

    if (error.message === 'Not authorized') {
      return res.status(403).json({ message: error.message });
    }

    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }

    // أخطاء تتعلق بالإلغاء
    if (error.message.includes('already cancelled') ||
        error.message.includes('Cancel window') ||
        error.message.includes('Invalid status')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderToPaid,
  cancelOrder
};
```

**الفوائد من Controller:**
- ✅ استقبال الطلب من العميل (req)
- ✅ استدعاء Service للمعالجة
- ✅ معالجة الأخطاء بناءً على نوعها
- ✅ إرسال Response صحيح

**نقاط مهمة:**
```javascript
// ❌ لا نفعل في Controller:
const order = await Order.find();  // لا نصل DB مباشرة!

// ✅ الصحيح:
const order = await orderService.getUserOrders(userId);
```

---

### 3️⃣ SERVICE (اللوجيك)

**ملف:** `services/orderService.js`

```javascript
// استيراد الـ Models والـ Libraries
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { canTransition } = require('../utils/orderStateRules');
const { createRefund } = require('./refundServiceFull');

/**
 * Validate and Calculate Order
 * 
 * الشرح:
 * - فحص أن المنتجات موجودة
 * - فحص المخزون
 * - حساب السعر النهائي
 * - حساب الضرائب والشحن
 */
const validateAndCalculateOrder = async (orderItems) => {
  // 1. فحص أن orderItems موجودة
  if (!orderItems || orderItems.length === 0) {
    throw new Error('Order items are required');
    // هذا الـ Error سيتم اكتشافه في Controller
  }

  // 2. متغير لجمع السعر الإجمالي
  let itemsPrice = 0;

  // 3. حلقة على كل عنصر في الأوردر
  for (const item of orderItems) {
    // 4. البحث عن المنتج في Database
    const product = await Product.findById(item.product);

    // 5. فحص إذا المنتج موجود
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    // 6. فحص المخزون كافي
    if (product.countInStock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    // 7. إضافة بيانات المنتج للعنصر
    item.name = product.name;
    item.price = product.price;
    item.image = product.image;

    // 8. جمع السعر الإجمالي
    itemsPrice += product.price * item.quantity;
  }

  // 9. حساب الضرائب (15%)
  const taxRate = 0.15;
  const taxAmount = +(itemsPrice * taxRate).toFixed(2);
  // +      : تحويل النص لرقم
  // toFixed(2): كسور عشرية فقط (مثل 99.99)

  // 10. حساب سعر الشحن
  const shippingPrice = 10;

  // 11. حساب الخصم (0% الآن)
  const discountRate = 0;
  const discountAmount = +(itemsPrice * discountRate).toFixed(2);

  // 12. حساب السعر النهائي
  const totalPrice = +(
    itemsPrice +        // سعر المنتجات
    taxAmount +         // الضرائب
    shippingPrice -     // سعر الشحن
    discountAmount      // الخصم
  ).toFixed(2);

  // 13. إرجاع كل البيانات المحسوبة
  return {
    orderItems: orderItems,  // المنتجات مع البيانات الكاملة
    itemsPrice: itemsPrice,
    taxAmount: taxAmount,
    shippingPrice: shippingPrice,
    discountAmount: discountAmount,
    totalPrice: totalPrice
  };
};

/**
 * Create Order
 * 
 * الشرح:
 * - إنشاء أوردر جديد في Database
 * - فحص البيانات أولاً
 */
const createOrder = async (userId, orderData) => {
  // 1. استخراج البيانات من orderData
  const { orderItems, shippingAddress } = orderData;

  // 2. فحص أن عنوان الشحن موجود
  if (!shippingAddress) {
    throw new Error('Shipping address is required');
  }

  // 3. التحقق من المنتجات وحساب السعر
  const priceData = await validateAndCalculateOrder(orderItems);

  // 4. إنشاء الأوردر في Database
  const order = await Order.create({
    user: userId,                           // معرف المستخدم
    orderItems: priceData.orderItems,      // المنتجات
    shippingAddress: shippingAddress,      // عنوان الشحن
    itemsPrice: priceData.itemsPrice,      // سعر المنتجات
    taxAmount: priceData.taxAmount,        // الضرائب
    shippingPrice: priceData.shippingPrice, // الشحن
    discountAmount: priceData.discountAmount, // الخصم
    totalPrice: priceData.totalPrice,      // الإجمالي
    status: 'pending',                     // الحالة الأولية
    isPaid: false,                         // لم يتم الدفع بعد
    isDelivered: false,                    // لم يتم التوصيل بعد
    invoiceNumber: `INV-${Date.now()}`    // رقم الفاتورة الفريد
  });

  // 5. إرجاع الأوردر المنشأ
  return order;
};

/**
 * Get User Orders
 * 
 * الشرح:
 * - جلب جميع أوردرات المستخدم
 */
const getUserOrders = async (userId) => {
  // 1. البحث عن الأوردرات
  return await Order.find({
    user: userId,              // فقط أوردرات هذا المستخدم
    isDeleted: false           // فقط الأوردرات غير المحذوفة
  }).sort({
    createdAt: -1              // بترتيب أحدث أولاً (-1)
  });
};

/**
 * Get Order By ID
 * 
 * الشرح:
 * - جلب أوردر واحد مع فحص الملكية
 */
const getOrderById = async (orderId, user) => {
  // 1. البحث عن الأوردر
  const order = await Order.findById(orderId);

  // 2. فحص الأوردر موجود و ما محذوف
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // 3. فحص الملكية (هل المستخدم صاحب الأوردر أو Admin)
  if (
    order.user.toString() !== user._id.toString() &&  // ليس صاحب
    user.role !== 'admin'                             // وليس Admin
  ) {
    throw new Error('Not authorized');
  }

  // 4. إرجاع الأوردر
  return order;
};

/**
 * Update Order to Paid
 * 
 * الشرح:
 * - تحديث الأوردر إلى مدفوع
 * - إنقاص المخزون بشكل آمن (Atomic Transaction)
 * 
 * لماذا Transaction؟
 * - إذا حدث خطأ أثناء إنقاص المخزون، نلغي كل شيء
 * - نضمن عدم فقدان البيانات
 */
const updateOrderToPaid = async (orderId, user) => {
  // 1. بدء Transaction (عملية آمنة)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. جلب الأوردر داخل الـ Transaction
    const order = await Order.findById(orderId).session(session);

    // 3. فحص الأوردر موجود
    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    // 4. فحص الملكية
    if (
      order.user.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      throw new Error('Not authorized');
    }

    // 5. فحص الأوردر ما مدفوع مسبقاً
    if (order.isPaid) {
      throw new Error('Order already paid');
    }

    // 6. فحص الانتقال من حالة لحالة صحيح
    if (!canTransition(order.status, 'paid')) {
      throw new Error('Invalid status transition');
    }

    // 7. إنقاص المخزون لكل منتج
    for (const item of order.orderItems) {
      // 7.1. تحديث المنتج بشكل Atomic
      const result = await Product.updateOne(
        {
          _id: item.product,                  // معرف المنتج
          countInStock: { $gte: item.quantity } // فحص المخزون كافي
        },
        {
          $inc: { countInStock: -item.quantity } // إنقاص المخزون
        },
        { session }  // داخل الـ Transaction
      );

      // 7.2. فحص نجح التحديث
      if (result.modifiedCount === 0) {
        throw new Error('Insufficient stock');
      }
    }

    // 8. تحديث الأوردر
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'paid';

    // 9. حفظ الأوردر داخل الـ Transaction
    await order.save({ session });

    // 10. تأكيد جميع التغييرات
    await session.commitTransaction();
    session.endSession();

    // 11. إرجاع الأوردر المحدث
    return order;

  } catch (error) {
    // إذا حصل خطأ في أي نقطة
    // الغاء جميع التغييرات
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancel Order
 * 
 * الشرح:
 * - إلغاء الأوردر في خلال 15 دقيقة
 * - استرجاع المخزون
 * - إنشاء Refund إذا كان مدفوع
 */
const cancelOrder = async (orderId, user) => {
  // 1. بدء Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. جلب الأوردر
    const order = await Order.findById(orderId).session(session);

    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    // 3. فحص الملكية
    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Not authorized');
    }

    // 4. فحص الأوردر ما ملغي مسبقاً
    if (order.status === 'cancelled') {
      throw new Error('Order already cancelled');
    }

    // 5. فحص الناتجة (فقط للمستخدمين العاديين، ليس Admin)
    if (isOwner && !isAdmin) {
      // حساب الفرق بالدقائق
      const diffMinutes = (Date.now() - order.createdAt) / (1000 * 60);

      // فحص أقل من 15 دقيقة
      if (diffMinutes > 15) {
        throw new Error('Cancel window expired');
      }

      // فحص الانتقال صحيح
      if (!canTransition(order.status, 'cancelled')) {
        throw new Error('Invalid status transition');
      }
    }

    // 6. استرجاع المخزون لكل منتج
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } }, // إضافة المخزون
        { session }
      );
    }

    // 7. تحديث الأوردر
    order.status = 'cancelled';
    order.isDeleted = true;
    order.deletedAt = new Date();

    await order.save({ session });

    // 8. تأكيد التغييرات
    await session.commitTransaction();
    session.endSession();

    // 9. إنشاء Refund إذا كان مدفوع
    if (order.isPaid) {
      try {
        // استدعاء دالة من refundServiceFull
        const refund = await createRefund({
          orderId: order._id,
          userId: user._id,
          amount: order.totalPrice
        });

        // ربط الـ Refund بالأوردر
        order.refund = refund._id;
        order.refundStatus = 'pending';
        await order.save();

      } catch (err) {
        // إذا فشل الـ Refund، لا نلغي الأوردر
        console.error('Refund failed:', err.message);
      }
    }

    return order;

  } catch (error) {
    // إلغاء التغييرات عند الخطأ
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderToPaid,
  cancelOrder,
  validateAndCalculateOrder
};
```

**الفوائد من Service:**
- ✅ كل اللوجيك في مكان واحد
- ✅ يمكن استخدامه من عدة Controllers
- ✅ آمن (Transactions, Authorization)
- ✅ سهل الاختبار

---

### 4️⃣ MODEL (قاعدة البيانات)

**ملف:** `models/Order.js`

```javascript
const mongoose = require('mongoose');

// تعريف شكل الأوردر في Database
const orderSchema = new mongoose.Schema({
  // المستخدم صاحب الأوردر
  user: {
    type: mongoose.Schema.Types.ObjectId,  // ربط بـ User
    ref: 'User',                           // اسم الـ Model
    required: true
  },

  // المنتجات في الأوردر
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,  // ربط بـ Product
        ref: 'Product',
        required: true
      },
      name: String,      // اسم المنتج
      quantity: Number,  // الكمية
      price: Number,     // السعر
      image: String      // الصورة
    }
  ],

  // عنوان الشحن
  shippingAddress: {
    type: String,
    required: true
  },

  // الأسعار
  itemsPrice: Number,      // سعر المنتجات قبل الضرائب
  taxAmount: Number,       // الضرائب
  shippingPrice: Number,   // الشحن
  discountAmount: Number,  // الخصم
  totalPrice: Number,      // الإجمالي

  // حالة الأوردر
  status: {
    type: String,
    enum: ['pending', 'paid', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // هل مدفوع؟
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,  // متى تم الدفع؟

  // هل تم التوصيل؟
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,  // متى تم التوصيل؟

  // حذف آمن (البيانات تبقى في Database)
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,

  // رقم الفاتورة الفريد
  invoiceNumber: String,

  // معلومات الوقت
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
```

---

## 🎯 شرح Services الأخرى

### productService.js

```javascript
const Product = require('../models/Product');

// ✅ إنشاء منتج جديد
const createProduct = async (productData) => {
  // 1. إنشاء منتج جديد من البيانات
  const product = new Product(productData);

  // 2. حفظ في Database
  return await product.save();
};

// ✅ جلب جميع المنتجات
const getAllProducts = async () => {
  return await Product.find();
};

// ✅ جلب منتج واحد مع فحص الوجود
const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  return product;
};

// ✅ تحديث منتج
const updateProductById = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }  // إرجاع النسخة المحدثة
  );

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  return product;
};

// ✅ حذف منتج
const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById
};
```

---

### userService.js

```javascript
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ✅ تسجيل مستخدم جديد
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // 1. فحص البريد مكرر
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('المستخدم موجود مسبقاً');
  }

  // 2. إنشاء مستخدم جديد
  const user = await User.create({
    name,
    email,
    password  // يتم تشفيره تلقائياً في Model
  });

  if (!user) {
    throw new Error('بيانات غير صالحة');
  }

  // 3. إرجاع البيانات مع Token
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)  // توليد JWT Token
  };
};

// ✅ تسجيل دخول
const loginUser = async (email, password) => {
  // 1. البحث عن المستخدم
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // 2. فحص كلمة المرور
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // 3. توليد Token
  const token = generateToken(user._id);

  // 4. إرجاع البيانات
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  };
};

// ✅ جلب البيانات
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
```

---

### refundServiceFull.js

```javascript
const Refund = require('../models/Refund');
const Order = require('../models/Order');

// ✅ فحص صحة طلب الاسترجاع
const validateRefundRequest = async (orderId, amount, userId, userRole) => {
  // 1. فحص المبلغ موجب
  if (!amount || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // 2. فحص الأوردر موجود
  const order = await Order.findById(orderId);
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // 3. فحص التصريح (الملكية أو Admin)
  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new Error('Not authorized to refund this order');
  }

  // 4. فحص الأوردر مدفوع
  if (!order.isPaid) {
    throw new Error('Order is not paid yet');
  }

  // 5. فحص المبلغ لا يتجاوز الإجمالي
  if (amount > order.totalPrice) {
    throw new Error(`Refund amount cannot exceed order total: ${order.totalPrice}`);
  }

  // 6. فحص ما يوجد refund موجود بالفعل
  const existingRefund = await Refund.findOne({
    order: orderId,
    status: { $in: ['pending', 'success'] }
  });

  if (existingRefund) {
    throw new Error('Refund already exists for this order');
  }

  return order;
};

// ✅ إنشاء طلب استرجاع
const createRefund = async ({ orderId, userId, amount }) => {
  // 1. إنشاء طلب استرجاع
  const refund = await Refund.create({
    order: orderId,
    user: userId,
    amount: amount,
    status: 'pending'
  });

  // 2. معالجة الاسترجاع في الخلفية (بدون انتظار)
  setImmediate(() => {
    processRefund(refund._id);
  });

  return refund;
};

// ✅ معالجة الاسترجاع مع محاولات إعادة
const processRefund = async (refundId) => {
  const refund = await Refund.findById(refundId);

  if (!refund) return;

  // فحص لم تتجاوز 3 محاولات
  if (refund.retryCount >= 3) return;

  try {
    // محاكاة: 70% نجاح، 30% فشل
    const success = Math.random() > 0.3;

    if (!success) throw new Error('Payment failed');

    // تحديث الحالة لنجح
    refund.status = 'success';
    refund.processedAt = new Date();

    await refund.save();

    // ربط بالأوردر
    await Order.findByIdAndUpdate(refund.order, {
      refund: refund._id,
      refundStatus: 'success'
    });

  } catch (error) {
    // إذا فشل، نحاول مرة أخرى
    refund.retryCount += 1;
    refund.failureReason = error.message;

    if (refund.retryCount < 3) {
      // إعادة محاولة بعد 5 ثوانٍ
      refund.status = 'pending';
      await refund.save();

      setTimeout(() => {
        processRefund(refund._id);
      }, 5000);

    } else {
      // فشل نهائي بعد 3 محاولات
      await Order.findByIdAndUpdate(refund.order, {
        refundStatus: 'failed'
      });
    }
  }
};

module.exports = {
  validateRefundRequest,
  createRefund,
  processRefund
};
```

---

## 🔐 MIDDLEWARE (الفحوصات)

**ملف:** `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware: فحص التوكن
const protect = async (req, res, next) => {
  let token;

  // 1. استخراج التوكن من Headers
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {

    // صيغة: "Bearer eyJhbGci..."
    // نأخذ الجزء الثاني بعد "Bearer "
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. فحص التوكن موجود
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized to access this route'
    });
  }

  try {
    // 3. فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. جلب بيانات المستخدم من Database
    req.user = await User.findById(decoded.id);

    // 5. فحص المستخدم موجود
    if (!req.user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // 6. الانتقال للـ Middleware أو Controller التالي
    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized to access this route'
    });
  }
};

// ✅ Middleware: فحص Admin
const admin = (req, res, next) => {
  // 1. فحص أن req.user موجود (وضعه protect)
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authorized'
    });
  }

  // 2. فحص أن role هو "admin"
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Not authorized to access this route'
    });
  }

  // 3. الانتقال للخطوة التالية
  next();
};

module.exports = { protect, admin };
```

**الشرح:**
- `protect`: تفحص أن التوكن موجود وصحيح
- `admin`: تفحص أن المستخدم Admin

في الـ Route:
```javascript
router.delete("/:id", protect, admin, deleteOrder);
// استدعاء الترتيب:
// 1. protect = فحص التوكن
// 2. admin = فحص Admin
// 3. deleteOrder = الـ Controller
```

---

## 📊 HTTP Status Codes - المهم جداً!

| الكود | المعنى | الحالة | المثال |
|------|--------|--------|---------|
| 201 | Created | نجح + أنشأ مورد | POST، إنشاء أوردر |
| 200 | OK | نجح | GET، PUT |
| 400 | Bad Request | بيانات خاطئة | بيانات ناقصة |
| 401 | Unauthorized | ما موجود توكن | بريد/كلمة خاطئة |
| 403 | Forbidden | ليس صاحب | موظف يحاول حذف |
| 404 | Not Found | غير موجود | Order ما موجود |
| 500 | Server Error | خطأ | Database error |

---

## 🔄 مثال عملي متكامل: إنشاء أوردر

```javascript
// 1️⃣ العميل يرسل طلب
POST /api/orders
Headers: {
  Authorization: "Bearer eyJhbGci..."
}
Body: {
  orderItems: [
    { product: "6505abc123", quantity: 2 }
  ],
  shippingAddress: "123 Main St"
}

// 2️⃣ Route توجه الطلب
router.post("/", protect, createOrder);

// 3️⃣ protect middleware تفحص التوكن
const decoded = jwt.verify(token, JWT_SECRET);
req.user = await User.findById(decoded.id);
next();  // انتقل للـ Controller

// 4️⃣ Controller تستقبل
const createOrder = async (req, res) => {
  const order = await orderService.createOrder(
    req.user._id,   // معرف المستخدم من التوكن
    req.body        // البيانات
  );
  res.status(201).json(order);
};

// 5️⃣ Service تعالج اللوجيك
const createOrder = async (userId, orderData) => {
  // فحص العنوان
  if (!orderData.shippingAddress) {
    throw new Error('Shipping address is required');
  }

  // فحص والمنتجات والحساب
  const priceData = await validateAndCalculateOrder(
    orderData.orderItems
  );

  // إنشاء في Database
  const order = await Order.create({...});
  return order;
};

// 6️⃣ Service ترمي Error إذا فشل
throw new Error('Product not found');

// 7️⃣ Controller تاخذ الـ Error وترسل Response
catch (error) {
  res.status(400).json({ message: error.message });
}

// 8️⃣ العميل يستقبل Response
{
  status: 201,
  body: {
    _id: "6505order123",
    status: "pending",
    totalPrice: 99.99,
    ...
  }
}
```

---

## ⚠️ النقاط المهمة جداً!

### ✅ افعل:

```javascript
// ✅ Service للمنطق
const order = await orderService.createOrder(userId, data);

// ✅ Controller للاستقبال والإرسال
try {
  const result = await service.doSomething();
  res.json(result);
} catch (error) {
  res.status(400).json({...});
}

// ✅ ارمي الأخطاء من Service
throw new Error('User not found');

// ✅ اعالجها في Controller
if (error.message === 'User not found') {
  res.status(404).json({...});
}

// ✅ استخدم Authorization
if (order.user !== userId && role !== 'admin') {
  throw new Error('Not authorized');
}

// ✅ استخدم Transactions للعمليات المهمة
const session = await mongoose.startSession();
session.startTransaction();
```

### ❌ لا تفعل:

```javascript
// ❌ لا توجد لوجيك في Controller
const product = await Product.findById(id);
const price = product.price * 1.1;

// ❌ لا تصل Database من Controller
Order.find({...});

// ❌ لا ترمي Error بدون معالجة
throw new Error('Something happened');

// ❌ لا تنسى فحص الملكية
if (orderId === someId) {  // ❌ خطير!
  // ليس آمن
}

// ✅ الصحيح:
if (order.user.toString() !== userId.toString() &&
    user.role !== 'admin') {
  throw new Error('Not authorized');
}
```

---

## 🎓 الخلاصة

### البنية:
1. **Route**: توجيه الطلب
2. **Controller**: استقبال + معالجة الأخطاء
3. **Service**: كل اللوجيك
4. **Model**: قاعدة البيانات

### معادلة:
```
Clean Code = كل طبقة لها مسؤولية واحدة فقط
```

### الفائدة:
- ✅ سهل الفهم
- ✅ سهل الصيانة
- ✅ سهل الاختبار
- ✅ آمن جداً

---

**الآن انسخ هذا الملف وابعته إلى ChatGPT أو معلمك لتشرح عليه الكود!** 📤

**تم بواسطة:** GitHub Copilot
