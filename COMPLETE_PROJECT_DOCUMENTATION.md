# 📚 توثيق المشروع الكامل - Pirate Store Backend

## مقدمة عن المشروع

هذا مشروع **تطبيق متجر إلكتروني (E-Commerce)** بناءً على **Node.js + Express + MongoDB**.

### الميزات الرئيسية:
- ✅ نظام تسجيل المستخدمين (Register/Login)
- ✅ إدارة المنتجات (CRUD)
- ✅ نظام الطلبات (Orders)
- ✅ نظام الاسترجاع والاسترداد (Refunds)
- ✅ حماية المسارات بـ JWT Token
- ✅ صلاحيات Admin و User
- ✅ معالجة الأخطاء الموحدة
- ✅ تحديث المخزون الآمن (Transactions)

---

## 🏗️ هيكل المشروع

```
pirate-store-backend/
├── config/
│   └── db.js                 # اتصال قاعدة البيانات
├── controllers/              # معالجات الطلبات
│   ├── userController.js
│   ├── productController.js
│   ├── OrderController.js
│   └── refundController.js
├── middleware/               # البرمجيات الوسيطة
│   ├── authMiddleware.js
│   └── errorHandlerUtil.js
├── models/                   # نماذج قاعدة البيانات
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Refund.js
├── routes/                   # المسارات (Routes)
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── refundRoutes.js
├── services/                 # منطق الأعمال
│   ├── userService.js
│   ├── productService.js
│   ├── orderService.js
│   ├── refundService.js
│   └── refundServiceFull.js
├── utils/                    # أدوات مساعدة
│   ├── generateToken.js
│   └── orderStateRules.js
├── server.js                 # نقطة الدخول الرئيسية
└── package.json              # المكتبات والاعتماديات
```

---

## 📦 package.json

```json
{
  "name": "pirate-store-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "test:refund": "node scripts/test-refund.js",
    "start": "node server.js",
    "dev": "nodemon server.js "
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",         // تشفير كلمات المرور
    "cors": "^2.8.6",             // السماح بطلبات من نطاقات مختلفة
    "dotenv": "^17.4.2",          // متغيرات البيئة
    "express": "^5.2.1",          // إطار العمل الرئيسي
    "jsonwebtoken": "^9.0.2",     // توليد وتحقق من الـ Tokens
    "mongoose": "^9.2.1",         // مكتبة التعامل مع MongoDB
    "slugify": "^1.6.6"           // تحويل النصوص إلى صيغة URL
  },
  "devDependencies": {
    "nodemon": "^3.1.11"          // إعادة تشغيل الخادم تلقائياً أثناء التطوير
  }
}
```

---

## 🚀 server.js - نقطة الدخول الرئيسية

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require("./routes/orderRoutes");
const refundRoutes = require('./routes/refundRoutes');
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

const app = express();

// البرمجيات الوسيطة
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// المسارات
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.send('API is running ');
});
app.use("/api/orders", orderRoutes);
app.use('/api/refunds', refundRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

**التفاصيل:**
- استخدام CORS للسماح بطلبات من نطاقات مختلفة
- تحديث JSON و URL encoded middleware
- ربط مسارات API الأربعة الرئيسية
- الاستماع على المنفذ المحدد (افتراضياً 5000)

---

## 🔧 config/db.js - اتصال قاعدة البيانات

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

**التفاصيل:**
- الاتصال بقاعدة البيانات MongoDB باستخدام متغير البيئة `MONGO_URL`
- معالجة الأخطاء والخروج من البرنامج إذا فشل الاتصال

---

## 👥 Models - نماذج قاعدة البيانات

### 1️⃣ models/User.js

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true  // حذف المسافات الزائدة
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
            'كلمة المرور ضعيفة جداً!'
      ]  
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// مقارنة كلمة المرور المدخلة مع المشفرة
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**الحقول:**
- `name`: اسم المستخدم
- `email`: البريد الإلكتروني (فريد)
- `password`: كلمة المرور (مشفرة تلقائياً)
- `role`: الدور (user أو admin)

**الميزات:**
- تشفير كلمة المرور باستخدام bcrypt
- التحقق من قوة كلمة المرور
- دالة للمقارنة بين كلمة المرور المدخلة والمشفرة

---

### 2️⃣ models/Product.js

```javascript
const mongoose = require('mongoose');
const slugify = require("slugify");
const productSchema = new mongoose.Schema ({
    name:{
        type: String,
        required: [true,"Product name is required"],
        trim: true
    },
    description:{
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        default: 0
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    countInStock: {
        type: Number,
        required: [true, "Stock count is required"],
        default: 0
    },
    image: {
        type: String,
        required: [true, "Product image is required"]
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

**الحقول:**
- `name`: اسم المنتج
- `description`: وصف المنتج
- `price`: سعر المنتج
- `category`: فئة المنتج
- `countInStock`: عدد الوحدات المتاحة
- `image`: رابط صورة المنتج
- `rating`: تقييم المنتج
- `numReviews`: عدد التقييمات

---

### 3️⃣ models/Order.js

```javascript
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
    taxRate: { type: Number },         // اختياري للعرض
    taxAmount: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    discountRate: { type: Number },    // اختياري للعرض
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
```

**الحقول الرئيسية:**
- `invoiceNumber`: رقم الفاتورة الفريد
- `user`: مرجع للمستخدم
- `orderItems`: مصفوفة بعناصر الطلب
- `shippingAddress`: عنوان الشحن
- `status`: حالة الطلب (pending, paid, shipped, delivered, cancelled)
- `refund`: مرجع لطلب الاسترداد
- `refundStatus`: حالة الاسترداد

**Soft Delete:**
- `isDeleted`: بدلاً من حذف الطلب مباشرة
- `deletedAt`: تاريخ الحذف

---

### 4️⃣ models/Refund.js

```javascript
const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    // ربط مع الطلب
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },

    // مين طلب الاسترجاع
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // المبلغ
    amount: {
      type: Number,
      required: true
    },

    // حالة الاسترجاع
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true
    },

    // عدد المحاولات
    retryCount: {
      type: Number,
      default: 0
    },

    // سبب الفشل
    failureReason: {
      type: String
    },

    // معرف العملية من مزود الدفع
    externalTransactionId: {
      type: String
    },

    // تواريخ مهمة
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
```

**الحقول:**
- `order`: مرجع الطلب المرتبط
- `user`: المستخدم الذي طلب الاسترداد
- `amount`: مبلغ الاسترداد
- `status`: حالة الاسترداد (pending, success, failed)
- `retryCount`: عدد محاولات معالجة الاسترداد

---

## 🛡️ Middleware - البرمجيات الوسيطة

### 1️⃣ middleware/authMiddleware.js

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// حماية المسارات - فقط المستخدمين المسجلين
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// فقط للأدمن
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
```

**الدوال:**
- `protect`: تحقق من وجود JWT token ويربط البيانات بـ `req.user`
- `admin`: تحقق من أن المستخدم هو admin

**الاستخدام:**
```javascript
router.get('/path', protect, handler);           // يحتاج تسجيل دخول
router.get('/path', protect, admin, handler);    // يحتاج admin
```

---

### 2️⃣ middleware/errorHandlerUtil.js

```javascript
const handleOrderError = (error) => {
  const errorResponses = {
    'Not authorized': { status: 403, message: error.message },
    'Order not found': { status: 404, message: error.message },
    'Order already paid': { status: 400, message: error.message },
    'Order not paid yet': { status: 400, message: error.message },
    'Order already delivered': { status: 400, message: error.message },
    'Order already cancelled': { status: 400, message: error.message },
    'Insufficient stock': { status: 400, message: error.message },
    'Cancel window expired': { status: 400, message: error.message },
  };

  if (errorResponses[error.message]) {
    return errorResponses[error.message];
  }

  for (const [key, value] of Object.entries(errorResponses)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  if (error.message.includes('Invalid status')) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: 'Internal Server Error' };
};

const handleRefundError = (error) => {
  const refundErrors = {
    'Order not found': { status: 404, message: error.message },
    'Not authorized': { status: 403, message: error.message },
    'No refund found for this order': { status: 404, message: error.message },
    'Amount must be a positive number': { status: 400, message: error.message },
    'already exists': { status: 400, message: error.message },
  };

  if (refundErrors[error.message]) {
    return refundErrors[error.message];
  }

  for (const [key, value] of Object.entries(refundErrors)) {
    if (error.message.includes(key)) {
      return value;
    }
  }

  return { status: 500, message: 'Internal Server Error' };
};

module.exports = {
  handleOrderError,
  handleRefundError
};
```

**الغرض:**
- توحيد معالجة الأخطاء لتجنب التكرار
- تحويل رسائل الأخطاء إلى رموز HTTP مناسبة

---

## 🎮 Controllers - معالجات الطلبات

### 1️⃣ controllers/userController.js

```javascript
const userService = require('../services/userService');

/**
 * Register User - POST /api/users/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Register Error:', error);

    if (error.message === 'المستخدم موجود مسبقاً') {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === 'بيانات غير صالحة') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Login User - POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const user = await userService.loginUser(req.body.email, req.body.password);
    res.status(200).json(user);
  } catch (error) {
    console.error('Login Error:', error);

    if (
      error.message === 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    ) {
      return res.status(401).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Get User Profile - GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update User Profile - PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res.status(200).json(user);
  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Users - GET /api/users
 * @access Private (Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete User by ID - DELETE /api/users/:id
 * @access Private (Admin)
 */
const deleteUserById = async (req, res) => {
  try {
    const result = await userService.deleteUserById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete User Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};
```

**الدوال:**
- `registerUser`: تسجيل مستخدم جديد
- `loginUser`: تسجيل الدخول
- `getUserProfile`: جلب بيانات المستخدم
- `updateUserProfile`: تعديل البيانات
- `getAllUsers`: جلب جميع المستخدمين (Admin)
- `deleteUserById`: حذف مستخدم (Admin)

---

### 2️⃣ controllers/productController.js

```javascript
const productService = require('../services/productService');

/**
 * Create Product - POST /api/products
 * @access Private (Admin)
 */
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get All Products - GET /api/products
 * @access Private
 */
const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء جلب المنتجات',
      error: error.message
    });
  }
};

/**
 * Get Product by ID - GET /api/products/:id
 * @access Private
 */
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error('Get Product By ID Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Product by ID - PUT /api/products/:id
 * @access Private (Admin)
 */
const updateProductById = async (req, res) => {
  try {
    const product = await productService.updateProductById(
      req.params.id,
      req.body
    );
    res.status(200).json(product);
  } catch (error) {
    console.error('Update Product Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update All Products - PUT /api/products
 * @access Private (Admin)
 */
const updateAllProducts = async (req, res) => {
  try {
    const result = await productService.updateAllProducts(req.body);
    res.status(200).json({
      message: `تم تحديث ${result.modifiedCount} منتجات.`
    });
  } catch (error) {
    console.error('Update All Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء تحديث كل المنتجات',
      error: error.message
    });
  }
};

/**
 * Delete Product by ID - DELETE /api/products/:id
 * @access Private (Admin)
 */
const deleteProductById = async (req, res) => {
  try {
    const product = await productService.deleteProductById(req.params.id);
    res.status(200).json({
      message: 'تم حذف المنتج بنجاح',
      deletedProduct: product
    });
  } catch (error) {
    console.error('Delete Product Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete All Products - DELETE /api/products
 * @access Private (Admin)
 */
const deleteAllProducts = async (req, res) => {
  try {
    const result = await productService.deleteAllProducts();
    res.status(200).json({
      message: `تم حذف ${result.deletedCount} منتجات.`
    });
  } catch (error) {
    console.error('Delete All Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء حذف كل المنتجات',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
};
```

**الدوال CRUD:**
- Create: إنشاء منتج جديد
- Read: جلب المنتجات (كل أو واحد)
- Update: تعديل منتج (واحد أو جميع)
- Delete: حذف منتج (واحد أو جميع)

---

### 3️⃣ controllers/OrderController.js

```javascript
const orderService = require('../services/orderService');
const { handleOrderError } = require('../middleware/errorHandlerUtil');

/**
 * Create Order - POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get My Orders - GET /api/orders/myorders
 * @access Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Get Order By ID - GET /api/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.status(200).json(order);
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Delete Order (Soft Delete) - DELETE /api/orders/:id
 * @access Private (Admin)
 */
const deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(200).json({ message: 'Order soft deleted successfully' });
  } catch (error) {
    console.error('Soft Delete Order Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Mark Order as Paid - PUT /api/orders/:id/pay
 * @access Private
 */
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await orderService.updateOrderToPaid(req.params.id, req.user);
    res.status(200).json({
      message: 'Order paid and stock updated successfully',
      order
    });
  } catch (error) {
    console.error('Update Order To Paid Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Mark Order as Delivered - PUT /api/orders/:id/deliver
 * @access Private (Admin)
 */
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await orderService.updateOrderToDelivered(
      req.params.id,
      req.user
    );
    res.status(200).json({
      message: 'Order marked as delivered',
      order
    });
  } catch (error) {
    console.error('Update Order To Delivered Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

/**
 * Cancel Order - PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user);
    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    const { status, message } = handleOrderError(error);
    res.status(status).json({ message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder
};
```

**الدوال:**
- `createOrder`: إنشاء طلب جديد
- `getUserOrders`: جلب طلبات المستخدم
- `getOrderById`: جلب طلب محدد
- `deleteOrder`: حذف soft delete
- `updateOrderToPaid`: تحديث الطلب لحالة paid
- `updateOrderToDelivered`: تحديث للمُسلّم
- `cancelOrder`: إلغاء الطلب (مع استرجاع المخزون)

---

### 4️⃣ controllers/refundController.js

```javascript
const refundService = require('../services/refundServiceFull');
const { handleRefundError } = require('../middleware/errorHandlerUtil');

/**
 * Initiate Refund - POST /api/refunds/orders/:id
 * @access Private
 */
const initiateRefund = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate refund request
    await refundService.validateRefundRequest(
      orderId,
      amount,
      userId,
      userRole
    );

    // Create refund
    const refund = await refundService.createRefund({
      orderId,
      userId,
      amount
    });

    res.status(201).json({
      message: 'Refund initiated successfully',
      refund
    });
  } catch (error) {
    console.error('Initiate Refund Error:', error);
    const { status, message } = handleRefundError(error);
    res.status(status).json({ message });
  }
};

/**
 * Get Refund by Order ID - GET /api/refunds/orders/:id
 * @access Private
 */
const getRefundByOrderId = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const refund = await refundService.getRefundByOrderId(orderId, req.user);
    res.status(200).json(refund);
  } catch (error) {
    console.error('Get Refund Error:', error);
    const { status, message } = handleRefundError(error);
    res.status(status).json({ message });
  }
};

/**
 * Get All Refunds - GET /api/refunds
 * @access Private (Admin Only)
 */
const getAllRefunds = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const refunds = await refundService.getAllRefunds();

    res.status(200).json({
      count: refunds.length,
      refunds
    });
  } catch (error) {
    console.error('Get All Refunds Error:', error);
    res.status(500).json({
      message: error.message || 'Internal Server Error'
    });
  }
};

/**
 * Get Refund Statistics - GET /api/refunds/stats
 * @access Private (Admin Only)
 */
const getRefundStats = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const stats = await refundService.getRefundStats();

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get Refund Stats Error:', error);
    res.status(500).json({
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
};
```

**الدوال:**
- `initiateRefund`: بدء عملية استرجاع
- `getRefundByOrderId`: جلب بيانات الاسترجاع
- `getAllRefunds`: جلب جميع عمليات الاسترجاع (Admin)
- `getRefundStats`: إحصائيات الاسترجاعات (Admin)

---

## 🛣️ Routes - المسارات

### 1️⃣ routes/userRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  deleteUserById 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// تسجيل مستخدم جديد - مفتوح للجميع
router.post('/register', registerUser);

// تسجيل الدخول - مفتوح للجميع
router.post('/login', loginUser);

// الحصول على بيانات المستخدم نفسه - يجب تسجيل الدخول
router.get('/profile', protect, getUserProfile);

// تعديل بيانات المستخدم نفسه - يجب تسجيل الدخول
router.put('/profile', protect, updateUserProfile);

// جلب كل المستخدمين - فقط الأدمن
router.get('/', protect, admin, getAllUsers);

// حذف مستخدم معين - فقط الأدمن
router.delete('/:id', protect, admin, deleteUserById);

module.exports = router;
```

**المسارات:**
```
POST   /api/users/register        - تسجيل جديد (Public)
POST   /api/users/login           - تسجيل دخول (Public)
GET    /api/users/profile         - بيانات الملف الشخصي (Private)
PUT    /api/users/profile         - تعديل الملف (Private)
GET    /api/users                 - جميع المستخدمين (Admin)
DELETE /api/users/:id             - حذف مستخدم (Admin)
```

---

### 2️⃣ routes/productRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
.get(protect, getProducts)
.post(protect, admin, createProduct) 
.put(protect, admin, updateAllProducts);

router.route('/:id')
.get(protect, getProductById)
.put(protect, admin, updateProductById);

router.delete('/:id', protect, admin, deleteProductById);
router.delete('/', protect, admin, deleteAllProducts);

module.exports = router;
```

**المسارات:**
```
GET    /api/products              - جميع المنتجات (Private)
POST   /api/products              - إنشاء منتج (Admin)
PUT    /api/products              - تحديث الكل (Admin)
GET    /api/products/:id          - منتج واحد (Private)
PUT    /api/products/:id          - تحديث منتج (Admin)
DELETE /api/products/:id          - حذف منتج (Admin)
DELETE /api/products              - حذف الكل (Admin)
```

---

### 3️⃣ routes/orderRoutes.js

```javascript
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
```

**المسارات:**
```
POST   /api/orders                - إنشاء طلب (Private)
GET    /api/orders/myorders       - طلبات المستخدم (Private)
GET    /api/orders/:id            - طلب واحد (Private)
DELETE /api/orders/:id            - حذف soft (Admin)
PUT    /api/orders/:id/pay        - تحديث لـ paid (Private)
PUT    /api/orders/:id/deliver    - تحديث لـ delivered (Admin)
PUT    /api/orders/:id/cancel     - إلغاء الطلب (Private)
```

---

### 4️⃣ routes/refundRoutes.js

```javascript
const express = require('express');
const router = express.Router();

const {
  initiateRefund,
  getRefundByOrderId,
  getAllRefunds,
  getRefundStats
} = require('../controllers/refundController');

const { protect, admin } = require('../middleware/authMiddleware');

// User Routes
router.post('/orders/:id', protect, initiateRefund);
router.get('/orders/:id', protect, getRefundByOrderId);

// Admin Routes
router.get('/', protect, admin, getAllRefunds);
router.get('/stats', protect, admin, getRefundStats);

module.exports = router;
```

**المسارات:**
```
POST   /api/refunds/orders/:id    - بدء استرجاع (Private)
GET    /api/refunds/orders/:id    - بيانات الاسترجاع (Private)
GET    /api/refunds               - جميع الاسترجاعات (Admin)
GET    /api/refunds/stats         - إحصائيات (Admin)
```

---

## 🔧 Services - منطق الأعمال

### 1️⃣ services/userService.js

```javascript
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('المستخدم موجود مسبقاً');
  }

  // Create new user (password will be hashed automatically in model)
  const user = await User.create({
    name,
    email,
    password
  });

  if (!user) {
    throw new Error('بيانات غير صالحة');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  };
};

/**
 * Get user profile
 */
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

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.name) {
    user.name = updateData.name;
  }

  if (updateData.email) {
    user.email = updateData.email;
  }

  if (updateData.password) {
    user.password = updateData.password; // Will be hashed automatically
  }

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    token: generateToken(updatedUser._id)
  };
};

/**
 * Get all users
 */
const getAllUsers = async () => {
  return await User.find().select('-password');
};

/**
 * Delete user by ID
 */
const deleteUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  await user.remove();

  return {
    message: 'User removed successfully'
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};
```

**الوظائف:**
- معالجة تسجيل المستخدمين
- التحقق من البريد الإلكتروني والكلمة المرور
- توليد JWT token
- جلب وتعديل بيانات المستخدم

---

### 2️⃣ services/productService.js

```javascript
const Product = require('../models/Product');

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

/**
 * Get all products
 */
const getAllProducts = async () => {
  return await Product.find();
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  return product;
};

/**
 * Update product by ID
 */
const updateProductById = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }
  );
  
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  
  return product;
};

/**
 * Update all products
 */
const updateAllProducts = async (updateData) => {
  const result = await Product.updateMany({}, updateData);
  return result;
};

/**
 * Delete product by ID
 */
const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  
  return product;
};

/**
 * Delete all products
 */
const deleteAllProducts = async () => {
  const result = await Product.deleteMany({});
  return result;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
};
```

**CRUD Operations:**
- Create, Read, Update, Delete
- البحث مع المعالجة الكاملة للأخطاء

---

### 3️⃣ services/orderService.js (الجزء المهم جداً)

```javascript
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { canTransition } = require('../utils/orderStateRules');
const { createRefund } = require('./refundServiceFull');

/**
 * Validate order items and calculate price
 */
const validateAndCalculateOrder = async (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    throw new Error('Order items are required');
  }

  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }

    if (product.countInStock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    validatedItems.push({
      ...item,
      name: product.name,
      price: product.price,
      image: product.image
    });

    itemsPrice += product.price * item.quantity;
  }

  // Calculate taxes and fees
  const taxRate = 0.15;
  const shippingPrice = 10;
  const discountRate = 0;

  const taxAmount = +(itemsPrice * taxRate).toFixed(2);
  const discountAmount = +(itemsPrice * discountRate).toFixed(2);
  const totalPrice = +(
    itemsPrice +
    taxAmount +
    shippingPrice -
    discountAmount
  ).toFixed(2);

  return {
    orderItems: validatedItems,
    itemsPrice,
    taxAmount,
    shippingPrice,
    discountAmount,
    totalPrice
  };
};

/**
 * Create a new order
 */
const createOrder = async (userId, orderData) => {
  const { orderItems, shippingAddress } = orderData;

  if (!shippingAddress) {
    throw new Error('Shipping address is required');
  }

  const priceData = await validateAndCalculateOrder(orderItems);

  const order = await Order.create({
    user: userId,
    orderItems: priceData.orderItems,
    shippingAddress,
    itemsPrice: priceData.itemsPrice,
    taxAmount: priceData.taxAmount,
    shippingPrice: priceData.shippingPrice,
    discountAmount: priceData.discountAmount,
    totalPrice: priceData.totalPrice,
    status: 'pending',
    isPaid: false,
    isDelivered: false,
    invoiceNumber: `INV-${Date.now()}`
  });

  return order;
};

/**
 * Get user's orders
 */
const getUserOrders = async (userId) => {
  return await Order.find({ user: userId, isDeleted: false }).sort({
    createdAt: -1
  });
};

/**
 * Get order by ID with authorization check
 */
const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // Check authorization
  if (
    order.user.toString() !== user._id.toString() &&
    user.role !== 'admin'
  ) {
    throw new Error('Not authorized');
  }

  return order;
};

/**
 * Delete order (soft delete - admin only)
 */
const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  order.isDeleted = true;
  order.deletedAt = new Date();
  await order.save();

  return order;
};

/**
 * Mark order as paid with atomic stock update
 */
const updateOrderToPaid = async (orderId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    // Validate order exists
    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    // Check authorization
    if (
      order.user.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      throw new Error('Not authorized');
    }

    // Check if already paid
    if (order.isPaid) {
      throw new Error('Order already paid');
    }

    // Check state transition
    if (!canTransition(order.status, 'paid')) {
      throw new Error('Invalid status transition');
    }

    // Atomically update stock
    for (const item of order.orderItems) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          countInStock: { $gte: item.quantity }
        },
        {
          $inc: { countInStock: -item.quantity }
        },
        { session }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Insufficient stock');
      }
    }

    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'paid';

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Mark order as delivered (admin only)
 */
const updateOrderToDelivered = async (orderId, user) => {
  const order = await Order.findById(orderId);

  // Validate order exists
  if (!order || order.isDeleted) {
    throw new Error('Order not found');
  }

  // Check admin role
  if (user.role !== 'admin') {
    throw new Error('Not authorized');
  }

  // Check if order is paid
  if (!order.isPaid) {
    throw new Error('Order is not paid yet');
  }

  // Check if already delivered
  if (order.isDelivered) {
    throw new Error('Order already delivered');
  }

  // Check state transition
  if (!canTransition(order.status, 'delivered')) {
    throw new Error('Invalid status transition');
  }

  // Update order
  order.isDelivered = true;
  order.deliveredAt = new Date();
  order.status = 'delivered';

  await order.save();

  return order;
};

/**
 * Cancel order (user within 15 minutes)
 */
const cancelOrder = async (orderId, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order || order.isDeleted) {
      throw new Error('Order not found');
    }

    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('Not authorized');
    }

    if (order.status === 'cancelled') {
      throw new Error('Order already cancelled');
    }

    // Check cancel window (15 minutes for users)
    if (isOwner && !isAdmin) {
      const diffMinutes = (Date.now() - order.createdAt) / (1000 * 60);

      if (diffMinutes > 15) {
        throw new Error('Cancel window expired');
      }

      if (!canTransition(order.status, 'cancelled')) {
        throw new Error('Invalid status transition');
      }
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } },
        { session }
      );
    }

    order.status = 'cancelled';
    order.isDeleted = true;
    order.deletedAt = new Date();

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Process refund if order was paid
    if (order.isPaid) {
      try {
        const refund = await createRefund({
          orderId: order._id,
          userId: user._id,
          amount: order.totalPrice
        });

        order.refund = refund._id;
        order.refundStatus = 'pending';
        await order.save();
      } catch (err) {
        console.error('Refund failed:', err.message);
      }
    }

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  validateAndCalculateOrder
};
```

**المميزات الرئيسية:**
1. **حساب الأسعار تلقائياً:**
   - سعر الأساسي (itemsPrice)
   - الضريبة (taxAmount = 15%)
   - الشحن (shippingPrice = 10)
   - الخصم (discountAmount)
   - الإجمالي (totalPrice)

2. **التحقق من المخزون:**
   - التحقق من وجود كل منتج
   - التحقق من الكمية المتاحة
   - تحديث آمن باستخدام Transactions

3. **حالات الطلب:**
   - pending → paid → shipped → delivered
   - أو pending → cancelled
   - التحقق من الانتقال الصحيح

4. **إلغاء الطلب:**
   - فقط خلال 15 دقيقة للمستخدمين
   - الأدمن يمكنه في أي وقت
   - استرجاع المخزون تلقائياً
   - معالجة الاسترداد المالي

---

### 4️⃣ services/refundService.js

```javascript
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

    // ربط مع order فقط (بدون تغيير status)
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
```

---

### 5️⃣ services/refundServiceFull.js (الإصدار الكامل)

```javascript
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
```

**الميزات:**
1. **معالجة الاسترجاع:**
   - إنشاء طلب استرجاع
   - معالجة بنسبة نجاح 70%
   - إعادة محاولة تلقائية (3 محاولات)

2. **التحقق:**
   - المبلغ موجب
   - الطلب موجود ودفع
   - المبلغ لا يتجاوز الإجمالي
   - عدم وجود استرجاع سابق

3. **الإحصائيات:**
   - عدد الطلبات الكلي
   - النجاح والفشل والمعلق
   - المبلغ الكلي المسترجع

---

## 🛠️ Utils - أدوات مساعدة

### 1️⃣ utils/generateToken.js

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
```

**الوظيفة:**
- توليد JWT token لمدة 30 يوم
- يحتوي على معرف المستخدم

---

### 2️⃣ utils/orderStateRules.js

```javascript
const allowedTransitions = {
  pending: ['paid', 'cancelled'],

  paid: ['shipped', 'cancelled'],

  shipped: ['delivered'],

  delivered: [],

  cancelled: []
};

const canTransition = (currentStatus, newStatus) => {
  return allowedTransitions[currentStatus]?.includes(newStatus);
};

module.exports = {
  allowedTransitions,
  canTransition
};
```

**الغرض:**
- تحديد الانتقالات المسموحة بين حالات الطلب
- منع الانتقالات غير المنطقية

**الانتقالات:**
```
pending  → paid أو cancelled
paid     → shipped أو cancelled
shipped  → delivered
delivered → (لا توجد انتقالات)
cancelled → (لا توجد انتقالات)
```

---

## 🔐 متغيرات البيئة المطلوبة

أنشئ ملف `.env` بالجذر:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/pirate-store
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## 📊 ملخص البنية

### Stack التكنولوجي:
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Development:** Nodemon

### المميزات الأساسية:
✅ Auth (User Registration & Login)
✅ Product Management (CRUD)
✅ Order Management (Create, Track, Cancel)
✅ Refund System (Request, Process, Stats)
✅ Role-Based Access (User vs Admin)
✅ Error Handling (Centralized)
✅ Database Transactions (Stock Management)
✅ Soft Delete (Data Preservation)

### Flow العام:
```
User Register/Login
    ↓
Get Token (JWT)
    ↓
Browse Products
    ↓
Create Order (Auto Calculate Price)
    ↓
Pay Order (Update Stock)
    ↓
Admin Delivers Order
    ↓
User Request Refund (if applicable)
    ↓
Refund Processed (Retry Logic)
```

---

## 🚀 كيفية البدء

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

---

## 📝 ملاحظات هامة

1. **الأسعار:**
   - الضريبة 15% من سعر المنتج
   - الشحن 10 ثابت
   - الخصم 0 حالياً (قابل للتطوير)

2. **إلغاء الطلب:**
   - المستخدمون: خلال 15 دقيقة من الإنشاء
   - الأدمن: في أي وقت

3. **الاسترداد:**
   - نسبة النجاح 70%
   - إعادة محاولة 3 مرات
   - بين كل محاولة 5 ثوان

4. **الصلاحيات:**
   - Public: Register + Login فقط
   - Private: تسجيل دخول مطلوب
   - Admin: دور admin مطلوب

---

## 💡 أفكار للتطوير المستقبلي

- [ ] إضافة نظام التقييمات والتعليقات
- [ ] نظام المفضلة
- [ ] سلة التسوق (Cart)
- [ ] نظام رموز الخصم (Coupons)
- [ ] معالجة الدفع الحقيقية (Stripe/PayPal)
- [ ] نظام الإشعارات
- [ ] تحسين الأداء (Caching)
- [ ] Tests الشاملة

---

## 🎓 للمزيد من الفهم

**الملفات الموثقة بالخط العربي تساعد على الفهم السريع.**

كل ملف يحتوي على comments تشرح الوظيفة بالتفصيل.

---

> **تم إنشاء هذا التوثيق بناءً على فهم كامل لأكواد المشروع**
> **آخر تحديث: 2026/05/23**

