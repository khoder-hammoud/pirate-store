# 🎯 دليل شامل لفهم مشروع Pirate Store Backend

---

## 📚 جدول المحتويات
1. [المقدمة والمفاهيم الأساسية](#-المقدمة-والمفاهيم-الأساسية)
2. [هيكل المشروع](#-هيكل-المشروع)
3. [ملفات الإعدادات والأساسيات](#-ملفات-الإعدادات-والأساسيات)
4. [نماذج البيانات Models](#-نماذج-البيانات-models)
5. [Middleware - الحماية والمصادقة](#-middleware---الحماية-والمصادقة)
6. [Controllers - منطق العمل](#-controllers---منطق-العمل)
7. [Routes - المسارات والواجهات](#-routes---المسارات-والواجهات)
8. [تدفق البيانات الكامل](#-تدفق-البيانات-الكامل)
9. [الأوامر والتشغيل](#-الأوامر-والتشغيل)

---

# 🎓 المقدمة والمفاهيم الأساسية

## ما هو Backend؟
Backend هو الجزء الخفي من التطبيق الذي يعمل على machine الخادم (Server). وظيفته:
- 📊 **إدارة البيانات** في قاعدة البيانات
- 🔐 **الحماية والمصادقة** (من هو المستخدم؟)
- ⚙️ **معالجة العمليات** (عمليات حسابية، حفظ، تحديث)
- 📡 **إرسال البيانات للعميل** (Frontend) عبر APIs

## ما هي REST API؟
API = Application Programming Interface (واجهة برمجية)

REST مبني على 5 operations:
| العملية | الرمز | الوصف | مثال |
|---------|------|-------|------|
| **READ** | GET | جلب البيانات | `GET /api/products` |
| **CREATE** | POST | إنشاء بيانات جديدة | `POST /api/products` |
| **UPDATE** | PUT | تحديث بيانات موجودة | `PUT /api/products/:id` |
| **DELETE** | DELETE | حذف بيانات | `DELETE /api/products/:id` |

## دورة Request / Response
```
1. العميل (Frontend) ينسلح طلب (Request)
   مثلاً: GET /api/products
   ↓
2. الخادم (Server) يستقبل الطلب
   ↓
3. Router يحدد أي Controller سيتعامل معه
   ↓
4. Controller يعالج العملية (مثلاً جلب من قاعدة البيانات)
   ↓
5. Controller يرسل الرد (Response) بالبيانات
```

---

# 📂 هيكل المشروع

```
pirate-store-backend/
│
├── 📄 server.js                    ← نقطة البداية الرئيسية
├── 📄 package.json                 ← المكتبات المستخدمة
├── 📄 .env                         ← متغيرات البيئة السرية (لم نرها بعد)
├── 📄 DEV_LOG.txt                  ← سجل التطوير
│
├── 📁 config/
│   └── db.js                       ← اتصال قاعدة البيانات MongoDB
│
├── 📁 models/                      ← نماذج البيانات (Schemas)
│   ├── User.js                     ← نموذج المستخدم
│   ├── Product.js                  ← نموذج المنتج
│   └── Order.js                    ← نموذج الطلب
│
├── 📁 middleware/                  ← الحماية والتحقق
│   └── authMiddleware.js           ← فحص التوكن و الصلاحيات
│
├── 📁 controllers/                 ← منطق العمل
│   ├── userController.js           ← عمليات المستخدمين
│   ├── productController.js        ← عمليات المنتجات
│   └── OrderController.js          ← عمليات الطلبات
│
├── 📁 routes/                      ← المسارات والروابط
│   ├── userRoutes.js               ← مسارات /api/users
│   ├── productRoutes.js            ← مسارات /api/products
│   └── orderRoutes.js              ← مسارات /api/orders
│
└── 📁 utils/                       ← وظائف مساعدة
    └── generateToken.js            ← توليد التوكن JWT
```

---

# 🔧 ملفات الإعدادات والأساسيات

## 📄 server.js (نقطة البداية)

```javascript
const express = require('express');                          // استدعاء مكتبة Express
const dotenv = require('dotenv');                           // مكتبة لقراءة متغيرات البيئة من ملف .env
const cors = require('cors');                               // مكتبة للسماح بطلبات من مصادر أخرى
const mongoose = require('mongoose');                       // مكتبة MongoDB
const connectDB = require('./config/db');                   // الاتصال بقاعدة البيانات

// --- الإعدادات الأساسية ---

dotenv.config();                                            // قراءة متغيرات البيئة

connectDB();                                                 // الاتصال بقاعدة البيانات

const app = express();                                      // إنشاء تطبيق Express

// --- Middleware ---

app.use(cors());                                            // السماح بطلبات من أي مصدر
app.use(express.json());                                    // قراءة البيانات JSON من الطلبات
app.use(express.urlencoded({ extended: false }));          // قراءة البيانات النصية

// --- Routes ---

app.use('/api/products', productRoutes);                    // تحويل طلبات /api/products للمعالج الخاص بها
app.use('/api/users', userRoutes);                          // تحويل طلبات /api/users للمعالج الخاص بها
app.use('/api/orders', orderRoutes);                        // تحويل طلبات /api/orders للمعالج الخاص بها

app.get('/', (req, res) => {
    res.send('API is running');                             // اختبار الخادم
});

// --- تشغيل الخادم ---

const PORT = process.env.PORT || 5000;                      // الباوت من متغيرات البيئة أو 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### شرح سطر بسطر:
- `require()` = استدعاء مكتبة
- `dotenv.config()` = قراءة ملف .env (يحتوي على كلمات السر والمتغيرات الحساسة)
- `app.use()` = استخدام middleware (معالج وسيط)
- `express.json()` = تحويل البيانات JSON تلقائياً

---

## 📄 config/db.js (الاتصال بقاعدة البيانات)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {                             // async = عملية قد تأخذ وقتاً
    try {                                                   // جرب
        await mongoose.connect(process.env.MONGO_URL);     // الاتصال (انتظر حتى ينتهي)
        console.log("MongoDB connected");                   // رسالة النجاح
    } catch (error) {                                       // لو حصل خطأ
        console.error(error);
        process.exit(1);                                    // أوقف البرنامج
    }
};

module.exports = connectDB;
```

### شرح المفاهيم:
- `async` = الدالة قد تنتظر عمليات (مثل الاتصال بالـ Database)
- `await` = انتظر حتى تنتهي هذه العملية
- `try/catch` = حاول العملية، إن حدث خطأ اتعامل معه بدل ما تتعطل البرنامج
- `process.env.MONGO_URL` = رابط قاعدة البيانات (مخزن في ملف .env للحماية)

---

## 📄 utils/generateToken.js (توليد التوكن)

```javascript
const jwt = require('jsonwebtoken');                        // مكتبة التوكن

const generateToken = (id) => {
    // jwt.sign() = توقيع توكن
    // الهدف: إنشاء بطاقة هوية رقمية للمستخدم
    return jwt.sign(
        { id },                                             // البيانات المراد حفظها في التوكن
        process.env.JWT_SECRET,                             // المفتاح السري (لا يعرفه إلا الخادم)
        { expiresIn: '30d' }                                // صلاحية التوكن: 30 يوم
    );
};

module.exports = generateToken;
```

### الفرق بين توكن JWT والباسورد:
- 🔑 **Passwords**: يخزن مشفر بـ bcrypt، لا يُرسل في الطلبات
- 🎫 **JWT Token**: يُرسل في كل طلب لإثبات أنك أنت (مثل بطاقة الهوية)

---

# 📊 نماذج البيانات Models

## 🧑 Model: User.js (نموذج المستخدم)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ====== الحقول الأساسية ======
    
    name: {
        type: String,                                       // نوع البيانات: نص
        required: true,                                     // إجباري (لازم)
        trim: true                                          // إزالة المسافات الزائدة
    },

    email: {
        type: String,
        required: true,
        unique: true,                                       // لا يمكن تكرار البريد
        lowercase: true,                                    // تحويل لأحرف صغيرة
        index: true                                         // تسريع البحث عن البريد
    },

    password: {
        type: String,
        required: true,
        minlength: 6,                                       // على الأقل 6 أحرف
        match: [                                            // قيود قوية للباسورد
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
            // التفسير:
            // (?=.*[a-z]) = يجب أن يحتوي على حرف صغير
            // (?=.*[A-Z]) = يجب أن يحتوي على حرف كبير
            // (?=.*\\d) = يجب أن يحتوي على رقم
            // (?=.*[!@#$%^&*]) = يجب أن يحتوي على رمز خاص
            // .{8,} = طول الباسورد 8 أحرف على الأقل
            'كلمة المرور ضعيفة جداً!'
        ]
    },

    role: {
        type: String,
        enum: ['user', 'admin'],                            // خيارات محدودة
        default: 'user'                                     // القيمة الافتراضية
    }
  },
  { timestamps: true }                                      // إضافة createdAt و updatedAt تلقائياً
);

// ====== Hook (خطاف) قبل الحفظ ======

userSchema.pre('save', async function () {
    // pre('save') = تنفيذ الكود قبل حفظ المستخدم في قاعدة البيانات
    
    // تجنب تشفير الباسورد مرتين
    if (!this.isModified('password')) {
        return;                                             // لا تفعل شيء
    }

    // توليد الملح (Salt) - رقم عشوائي لتقوية التشفير
    const salt = await bcrypt.genSalt(10);

    // تشفير الباسورد
    this.password = await bcrypt.hash(this.password, salt);
});

// ====== Method (دالة) مخصصة ======

userSchema.methods.comparePassword = async function (enteredPassword) {
    // هذه الدالة تقارن الباسورد المدخل مع الباسورد المشفر
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### شرح الحماية (Security):
```
المستخدم ينسخ: password123ABC!
         ↓
    bcrypt يشفره و يصير: $2a$10$x8Gu2Rk9...xyz (نص عشوائي طويل)
         ↓
   يُحفظ في قاعدة البيانات

عند تسجيل الدخول:
المستخدم ينسخ: password123ABC!
         ↓
    comparePassword كیفارن الاثنين (بطريقة آمنة)
         ↓
    النتيجة: صح أم غلط
```

---

## 📦 Model: Product.js (نموذج المنتج)

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema ({
    name:{
        type: String,
        required: [true, "Product name is required"],       // [condition, errorMessage]
        trim: true                                          // لا مسافات زائدة
    },
    
    description:{
        type: String,
        required: [true, "Product description is required"]
    },
    
    price: {
        type: Number,                                       // نوع البيانات: رقم
        required: [true, "Product price is required"],
        default: 0                                          // القيمة الافتراضية
    },
    
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    
    countInStock: {
        type: Number,
        required: [true, "Stock count is required"],       // عدد المنتجات المتاحة
        default: 0
    },
    
    image: {
        type: String,                                       // رابط الصورة (URL)
        required: [true, "Product image is required"]
    },
    
    rating: {
        type: Number,                                       // التقييم (من 1 لـ 5 مثلاً)
        default: 0
    },
    
    numReviews: {
        type: Number,                                       // عدد التقييمات
        default: 0
    },
    
}, { timestamps: true });                                   // تاريخ الإنشاء والتحديث

module.exports = mongoose.model('Product', productSchema);
```

---

## 📋 Model: Order.js (نموذج الطلب)

```javascript
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ====== معلومات الطلب الأساسية ======
    
    invoiceNumber: { 
        type: String, 
        required: true, 
        unique: true                                        // كل طلب له رقم فاتورة فريد
    },

    user: { 
        type: mongoose.Schema.Types.ObjectId,              // نوع: معرف من MongoDB
        ref: "User",                                        // يشير لنموذج User
        required: true                                      // يجب معرفة من قام بالطلب
    },

    // ====== تفاصيل المنتجات في الطلب ======
    
    orderItems: [
      {
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true                                  // المنتج الأصلي في قاعدة البيانات
        },
        name: { 
            type: String, 
            required: true                                  // اسم المنتج وقت الطلب (Snapshot)
        },
        price: { 
            type: Number, 
            required: true                                  // سعر المنتج وقت الطلب
        },
        quantity: { 
            type: Number, 
            required: true                                  // الكمية المطلوبة
        },
        image: { 
            type: String, 
            required: true                                  // صورة المنتج وقت الطلب
        },
      },
    ],

    // ====== عنوان الشحن ======
    
    shippingAddress: {
      address: { type: String },                           // الشارع والرقم
      city: { type: String },                              // المدينة
      postalCode: { type: String },                         // الرمز البريدي
      country: { type: String },                            // الدولة
      phone: { type: String },                              // رقم الهاتف
    },

    // ====== الحسابات والأسعار ======
    
    itemsPrice: { 
        type: Number, 
        required: true                                      // سعر المنتجات قبل الضرائب والشحن
    },
    
    taxRate: { 
        type: Number                                        // نسبة الضريبة (مثل 15%)
    },
    
    taxAmount: { 
        type: Number, 
        required: true                                      // قيمة الضريبة (حساب فعلي)
    },
    
    shippingPrice: { 
        type: Number, 
        required: true                                      // تكلفة الشحن
    },
    
    discountRate: { 
        type: Number                                        // نسبة الخصم (مثل 10%)
    },
    
    discountAmount: { 
        type: Number, 
        required: true                                      // قيمة الخصم (حساب فعلي)
    },
    
    totalPrice: { 
        type: Number, 
        required: true                                      // السعر النهائي: المنتجات + ضريبة + شحن - خصم
    },

    // ====== حالة الدفع والشحن ======
    
    status: {
      type: String,
      enum: ["pending","paid", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending"
    },
    
    isPaid: { 
        type: Boolean, 
        default: false                                      // هل تم الدفع؟
    },
    
    paidAt: { 
        type: Date                                          // متى تم الدفع؟
    },
    
    isRefunded: { 
        type: Boolean, 
        default: false                                      // هل تم استرجاع المال؟
    },
    
    refundedAt: { 
        type: Date                                          // متى تم الاسترجاع؟
    },
    
    isDelivered: { 
        type: Boolean, 
        default: false                                      // هل تم التسليم؟
    },
    
    deliveredAt: { 
        type: Date                                          // متى تم التسليم؟
    },

    // ====== الحذف الناعم (Soft Delete) ======
    // بدل حذف الطلب تماماً، نضع علامة أنه محذوف
    // لأن الطلبات بيانات مهمة جداً (قد نحتاج التاريخ)
    
    isDeleted: {
      type: Boolean,
      default: false
    },
    
    deletedAt: {
      type: Date
    },
  },
  {
    timestamps: true                                        // createdAt, updatedAt
  }
);

// ====== Indexes (لتسريع البحث) ======

orderSchema.index({ user: 1, createdAt: -1 });             // ابحث عن طلبات المستخدم والأحدث أولاً
orderSchema.index({ status: 1 });                          // ابحث حسب الحالة
orderSchema.index({ createdAt: 1 });                        // ابحث حسب التاريخ

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
```

### ملاحظات مهمة عن Order:
- **Snapshot**: نحفظ اسم وسعر المنتج وقت الطلب، لأن السعر قد يتغير لاحقاً
- **Soft Delete**: لا نحذف الطلبات بشكل كامل (نحتفظ بالرقم والتاريخ)
- **Indexes**: تسريع البحث عن طلبات المستخدم

---

# 🔐 Middleware - الحماية والمصادقة

## 📄 authMiddleware.js

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ====== Middleware #1: حماية المسارات ======

const protect = async (req, res, next) => {
    // الهدف: التأكد من أن المستخدم مسجل دخول (لديه توكن و يش)
    
    let token;

    // فحص وجود البيانات في رأس الطلب (Headers)
    if (
        req.headers.authorization &&                         // هل يوجد رأس authorization؟
        req.headers.authorization.startsWith('Bearer')       // هل يبدأ بكلمة "Bearer"؟
    ) {
        try {
            // استخراج التوكن من الرأس
            // مثال: "Bearer eyJhbGciOiJIUzI1NiI..." 
            // نأخذ فقط الجزء بعد "Bearer "
            token = req.headers.authorization.split(' ')[1];

            // التحقق من صحة التوكن
            // jwt.verify = فك تشفير التوكن والتأكد أنه لم يُعدِّل
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // جلب بيانات المستخدم من قاعدة البيانات
            req.user = await User.findById(decoded.id).select('-password');
            // select('-password') = جلب كل البيانات إلا كلمة المرور (أمان)

            // إتمام المعالجة
            next();
            
        } catch (error) {
            console.error(error);
            return res.status(401).json({ 
                message: 'Not authorized, token failed' 
            });
        }
    } else {
        // لم يرسل التوكن
        return res.status(401).json({ 
            message: 'Not authorized, no token' 
        });
    }
};

// ====== Middleware #2: فحص الصلاحيات (Admin فقط) ======

const admin = (req, res, next) => {
    // الهدف: التأكد من أن المستخدم هو Admin فقط
    
    if (req.user && req.user.role === 'admin') {
        // المستخدم موجود وهو Admin
        next();
    } else {
        // المستخدم عادي أو لا يوجد
        return res.status(403).json({ 
            message: 'Not authorized as an admin' 
        });
    }
};

module.exports = { protect, admin };
```

### كيفية استخدام Middleware:

```javascript
// في الروتس:
router.get('/profile', protect, getUserProfile);
//                      ↑
//              Middleware يفحص التوكن أولاً
//              إذا صح، ينادي getUserProfile

router.post('/delete-user', protect, admin, deleteUser);
//                          ↑          ↑
//                   فحص توكن   فحص Admin
```

### تدفق الطلب مع Middleware:

```
العميل ينسلح طلب مع التوكن:
GET /api/profile
Headers: Authorization: Bearer eyJhbGc...

         ↓
    protect Middleware يفحص:
    - هل يوجد توكن؟
    - هل التوكن صحيح؟
    - من المستخدم؟
    
         ↓
    إذا كل شيء صح:
    req.user = {معلومات المستخدم}
    ثم ينادي next()
    
         ↓
    Controller (مثل getUserProfile) يعمل
    ويصل لـ req.user
    
         ↓
    يرسل الرد (Response)
```

---

# ⚙️ Controllers - منطق العمل

## 🧑 userController.js

```javascript
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ====== دالة #1: تسجيل مستخدم جديد ======

const registerUser = async (req, res) => {
  try {
    // 1️⃣ استخراج البيانات من الطلب
    const { name, email, password } = req.body;
    //
    // req.body = البيانات المرسلة من العميل
    // مثال:
    // {
    //   "name": "أحمد",
    //   "email": "ahmed@example.com",
    //   "password": "Password123!"
    // }

    // 2️⃣ التحقق من عدم وجود المستخدم مسبقاً
    const userExists = await User.findOne({ email });
    // findOne() = ابحث عن واحد فقط

    if (userExists) {
      return res.status(400).json({
        message: "المستخدم موجود مسبقاً"
      });
      // 400 = Bad Request (البيانات المرسلة غير صالحة)
    }

    // 3️⃣ إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password
    });
    // ملاحظة: الباسورد يُشفر تلقائياً في User.js (في pre save hook)

    // 4️⃣ إرسال الرد
    if (user) {
      res.status(201).json({                              // 201 = Created (تم الإنشاء بنجاح)
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)                    // توليد توكن فوراً
      });
    } else {
      res.status(400).json({
        message: "بيانات غير صالحة"
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: error.message 
    });
    // 500 = Server Error (خطأ في السيرفر)
  }
};

// ====== دالة #2: تسجيل الدخول ======

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ البحث عن المستخدم
    const user = await User.findOne({ email });

    if (!user) {
      // ⚠️ أمان: نستخدم نفس الرسالة للبريد الخاطئ والباسورد الخاطئ
      // هذا لمنع الهاكرز من معرفة أي بريدات موجودة (User Enumeration Attack)
      return res.status(401).json({ 
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
      });
      // 401 = Unauthorized (غير مخول)
    }

    // 2️⃣ مقارنة الباسورد
    const isMatch = await user.comparePassword(password);
    // هذه الدالة مرفقة في User model

    if (!isMatch) {
      return res.status(401).json({ 
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
      });
    }

    // 3️⃣ إنشاء التوكن
    const token = generateToken(user._id);

    // 4️⃣ إرسال الرد
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ====== دالة #3: جلب بيانات المستخدم الحالي ======

const getUserProfile = async (req, res) => {
  try {
    // protect middleware أضاف req.user تلقائياً
    const user = req.user;

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
      // 404 = Not Found (غير موجود)
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ====== دالة #4: تحديث بيانات المستخدم ======

const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (user) {
      // تحديث البيانات (أو ترك القديمة إن لم تُرسل)
      user.name = req.body.name || user.name;             // إذا لم يرسل name، ترك القديم
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;                // سيُشفر تلقائياً
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ====== دالة #5: جلب كل المستخدمين (Admin فقط) ======

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');  // جلب الكل بدون كلمات المرور
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ====== دالة #6: حذف مستخدم (Admin فقط) ======

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // req.params.id = الـ ID من الرابط

    if (user) {
      await user.remove();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.log(error);
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

---

## 📦 productController.js

```javascript
const Product = require('../models/Product');

// ====== دالة #1: إنشاء منتج جديد (Admin فقط) ======

const createProduct = async (req, res) => {
    try{
        // استخراج البيانات من الطلب
        const { name, description, price, category, countInStock, image } = req.body;
        
        // إنشاء منتج جديد
        const product = new Product({
            name,
            description,
            price,
            category,
            countInStock,
            image
        });
        
        // حفظ في قاعدة البيانات
        const savedProduct = await product.save();
        
        res.status(201).json(savedProduct);
        // 201 = Created

    }catch (error) {
        console.error("🔥 Create Product Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ====== دالة #2: جلب كل المنتجات ======

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();              // جلب كل المنتجات
    res.status(200).json(products);
    // 200 = OK (العملية نجحت)
  } catch (error) {
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب المنتجات', 
      error: error.message 
    });
  }
};

// ====== دالة #3: جلب منتج واحد ======

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب المنتج', 
      error: error.message 
    });
  }
};

// ====== دالة #4: تحديث منتج واحد (Admin فقط) ======

const updateProductById = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,                                      // المنتج اللي نبي نحدثه
      req.body,                                           // البيانات الجديدة
      { new: true }                                       // ترجع البيانات المحدثة بدل القديمة
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ 
      message: 'حدث خطأ أثناء تحديث المنتج', 
      error: error.message 
    });
  }
};

// ====== دالة #5: تحديث كل المنتجات (Admin فقط) ======

const updateAllProducts = async (req, res) => {
  try {
    const result = await Product.updateMany({}, req.body);
    // {} = معناه كل المنتجات
    
    res.status(200).json({ 
      message: `تم تحديث ${result.modifiedCount} منتجات.` 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'حدث خطأ أثناء تحديث كل المنتجات', 
      error: error.message 
    });
  }
};

// ====== دالة #6: حذف منتج واحد (Admin فقط) ======

const deleteProductById = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.status(200).json({ 
      message: 'تم حذف المنتج بنجاح', 
      deletedProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'حدث خطأ أثناء حذف المنتج', 
      error: error.message 
    });
  }
};

// ====== دالة #7: حذف كل المنتجات (Admin فقط) ======

const deleteAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    // {} = كل المنتجات
    
    res.status(200).json({ 
      message: `تم حذف ${result.deletedCount} منتجات.` 
    });
  } catch (error) {
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

---

## 📋 OrderController.js (جزئي)

```javascript
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ====== دالة #1: إنشاء طلب جديد ======

const createOrder = async (req, res) => {
  try {
    // استخراج البيانات من الطلب
    const { orderItems, shippingAddress } = req.body;

    // التحقق من الأخطاء
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    let itemsPrice = 0;

    // معالجة كل منتج
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      // فحص المخزون
      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      // حفظ snapshot من بيانات المنتج
      item.name = product.name;
      item.price = product.price;
      item.image = product.image;

      // حساب السعر الإجمالي للمنتجات
      itemsPrice += product.price * item.quantity;
    }

    // حسابات الضريبة والشحن
    const taxRate = 0.15;                                   // 15%
    const shippingPrice = 10;
    const discountRate = 0;

    // ملاحظة: toFixed(2) = تقريب لـ 2 منازل عشرية
    // + في البداية = تحويل النتيجة من نص لرقم
    const taxAmount = +(itemsPrice * taxRate).toFixed(2);
    const discountAmount = +(itemsPrice * discountRate).toFixed(2);
    const totalPrice = +(
      itemsPrice +
      taxAmount +
      shippingPrice -
      discountAmount
    ).toFixed(2);

    // إنشاء الطلب
    const order = await Order.create({
      user: req.user._id,                                   // معرف المستخدم من protect middleware
      orderItems,
      shippingAddress,
      itemsPrice,
      taxAmount,
      shippingPrice,
      discountAmount,
      totalPrice,
      status: "pending",
      isPaid: false,
      isDelivered: false,
      invoiceNumber: `INV-${Date.now()}`,                   // رقم فاتورة فريد بناءً على الوقت
    });

    res.status(201).json(order);

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====== دالة #2: جلب طلبات المستخدم ======

const getUserOrders = async (req, res) => {
  try {
    // جلب الطلبات غير المحذوفة
    const orders = await Order.find({ 
      user: req.user._id,                                   // الطلبات الخاصة بهذا المستخدم فقط
      isDeleted: false                                      // بدون المحذوفة
    })
    .sort({ createdAt: -1 });                             // الأحدث أولاً

    res.status(200).json(orders);

  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====== دالة #3: جلب طلب واحد ======

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // فحص الملكية: فقط المالك والـ Admin يستطيعان الرؤية
    if (
      order.user.toString() !== req.user._id.toString() &&   // ليش toString()؟
      req.user.role !== "admin"                              // لأن ObjectId لا يساوي String مباشرة
    ) {
      return res.status(403).json({ message: "Not authorized" });
      // 403 = Forbidden (ممنوع)
    }

    res.status(200).json(order);

  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ====== دالة #4: حذف ناعم للطلب (Admin فقط) ======

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Soft Delete: نضع علامة "محذوف" بدل الحذف الحقيقي
    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();

    res.status(200).json({ message: "Order soft deleted successfully" });

  } catch (error) {
    console.error("Soft Delete Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder,
};
```

---

# 🛣️ Routes - المسارات والواجهات

## 📄 userRoutes.js

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

// ========== المسارات ==========

// 1️⃣ تسجيل مستخدم جديد - مفتوح (بدون تحقق)
router.post('/register', registerUser);
// مثال: POST /api/users/register
// البيانات: { "name": "أحمد", "email": "a@test.com", "password": "Pass123!" }

// 2️⃣ تسجيل الدخول - مفتوح
router.post('/login', loginUser);
// مثال: POST /api/users/login
// البيانات: { "email": "a@test.com", "password": "Pass123!" }
// الرد: { "token": "eyJ..." }

// 3️⃣ جلب بيانات المستخدم الحالي - يجب تسجيل دخول
router.get('/profile', protect, getUserProfile);
// مثال: GET /api/users/profile
// رأس الطلب: Authorization: Bearer eyJ...

// 4️⃣ تحديث بيانات المستخدم - يجب تسجيل دخول
router.put('/profile', protect, updateUserProfile);
// مثال: PUT /api/users/profile
// البيانات: { "name": "محمد" }

// 5️⃣ جلب كل المستخدمين - Admin فقط
router.get('/', protect, admin, getAllUsers);
// مثال: GET /api/users
// يجب أن تكون admin وعندك توكن صحيح

// 6️⃣ حذف مستخدم - Admin فقط
router.delete('/:id', protect, admin, deleteUserById);
// مثال: DELETE /api/users/507f1f77bcf86cd799439011
// يحذف المستخدم برقم ID محدد

module.exports = router;
```

---

## 📄 productRoutes.js

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

// ========== المسارات ==========

// POST و GET على /api/products
router.route('/')
  .get(protect, getProducts)                               // جلب كل المنتجات (مستخدم مسجل)
  .post(protect, admin, createProduct)                     // إنشاء منتج جديد (Admin)
  .put(protect, admin, updateAllProducts);                 // تحديث كل المنتجات (Admin)

// GET و PUT و DELETE على /api/products/:id
router.route('/:id')
  .get(protect, getProductById)                            // جلب منتج واحد (مستخدم مسجل)
  .put(protect, admin, updateProductById)                  // تحديث منتج (Admin)

// DELETE المنتج الواحد
router.delete('/:id', protect, admin, deleteProductById);

// DELETE كل المنتجات
router.delete('/', protect, admin, deleteAllProducts);

module.exports = router;
```

---

## 📄 orderRoutes.js

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

// ========== المسارات ==========

// POST: إنشاء طلب جديد (مستخدم مسجل)
router.post("/", protect, createOrder);
// مثال: POST /api/orders
// البيانات:
// {
//   "orderItems": [
//     {
//       "product": "507f1f77bcf86cd799439011",
//       "quantity": 2
//     }
//   ],
//   "shippingAddress": {
//     "address": "الشارع الرئيسي",
//     "city": "دمشق",
//     "country": "سوريا"
//   }
// }

// GET: جلب طلبات المستخدم (مستخدم مسجل)
router.get("/myorders", protect, getUserOrders);
// مثال: GET /api/orders/myorders
// الرد: قائمة الطلبات الخاصة بهذا المستخدم

// GET: جلب طلب واحد (مستخدم مسجل)
router.get("/:id", protect, getOrderById);
// مثال: GET /api/orders/507f1f77bcf86cd799439011
// الرد: تفاصيل الطلب

// DELETE: حذف ناعم للطلب (Admin فقط)
router.delete("/:id", protect, admin, deleteOrder);
// مثال: DELETE /api/orders/507f1f77bcf86cd799439011

// PUT: تحديث الطلب إلى "مدفوع" (مستخدم مسجل)
router.put("/:id/pay", protect, updateOrderToPaid);
// مثال: PUT /api/orders/507f1f77bcf86cd799439011/pay

// PUT: تحديث الطلب إلى "مُسلّم" (Admin فقط)
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);
// مثال: PUT /api/orders/507f1f77bcf86cd799439011/deliver

// PUT: إلغاء الطلب (مستخدم مسجل)
router.put("/:id/cancel", protect, cancelOrder);
// مثال: PUT /api/orders/507f1f77bcf86cd799439011/cancel

module.exports = router;
```

---

# 🔄 تدفق البيانات الكامل

## مثال عملي: عملية الشراء

### الخطوة 1: تسجيل المستخدم

```
العميل (Postman أو Frontend):
POST http://localhost:5000/api/users/register
{
  "name": "أحمد",
  "email": "ahmed@test.com",
  "password": "Password123!"
}
     ↓
Server يستقبل الطلب
     ↓
userRoutes.js توجهه لـ registerUser Controller
     ↓
Controller يفحص:
- هل البريد فريد؟
- هل الباسورد قوي؟
     ↓
قبل الحفظ، User Model يشفر الباسورد (pre save hook)
     ↓
قاعدة البيانات تحفظ المستخدم
     ↓
generateToken ينشئ توكن JWT
     ↓
Server يرسل الرد:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "أحمد",
  "email": "ahmed@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### الخطوة 2: تسجيل الدخول

```
العميل:
POST http://localhost:5000/api/users/login
{
  "email": "ahmed@test.com",
  "password": "Password123!"
}
     ↓
Controller يجد المستخدم
     ↓
comparePassword يقارن الباسورد المدخل مع المشفر
     ↓
إذا صح:
     ↓
generateToken ينشئ توكن جديد
     ↓
Server يرسل:
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "أحمد",
  "email": "ahmed@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### الخطوة 3: عرض المنتجات

```
العميل:
GET http://localhost:5000/api/products
Headers: Authorization: Bearer eyJhbGc...
     ↓
productRoutes يستقبل الطلب
     ↓
protect Middleware يعمل:
- يفك تشفير التوكن
- يجد المستخدم من قاعدة البيانات
- يحط بيانات المستخدم في req.user
- ينادي next()
     ↓
getProducts Controller يعمل
     ↓
Product.find() يجلب كل المنتجات من قاعدة البيانات
     ↓
Server يرسل قائمة المنتجات:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "سيف",
    "price": 100,
    "countInStock": 50,
    ...
  },
  ...
]
```

### الخطوة 4: إنشاء طلب

```
العميل:
POST http://localhost:5000/api/orders
Headers: Authorization: Bearer eyJhbGc...
Body:
{
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "الشارع الرئيسي 123",
    "city": "دمشق",
    "country": "سوريا",
    "phone": "0966123456"
  }
}
     ↓
protect Middleware يتحقق من التوكن
     ↓
createOrder Controller يعمل:
     ↓
أولاً: فحص المنتج في قاعدة البيانات
- هل المنتج موجود؟
- هل المخزون كافي (50 > 2)؟
     ↓
حساب السعر:
- itemsPrice = 100 * 2 = 200
- taxAmount = 200 * 0.15 = 30
- shippingPrice = 10
- discountAmount = 0
- totalPrice = 200 + 30 + 10 - 0 = 240
     ↓
Order Model تحفظ الطلب:
{
  "invoiceNumber": "INV-1713795123456",
  "user": "507f1f77bcf86cd799439011",
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439012",
      "name": "سيف",           ← Snapshot من وقت الطلب
      "price": 100,           ← لا يتغير إذا تغير السعر لاحقاً
      "quantity": 2,
      "image": "sword.jpg"
    }
  ],
  "shippingAddress": {...},
  "itemsPrice": 200,
  "taxAmount": 30,
  "shippingPrice": 10,
  "discountAmount": 0,
  "totalPrice": 240,
  "status": "pending",
  "isPaid": false,
  "isDelivered": false,
  "createdAt": "2024-04-22T10:12:03.456Z"
}
     ↓
Server يرسل الطلب المحفوظ:
{
  "_id": "507f1f77bcf86cd799439020",
  "invoiceNumber": "INV-1713795123456",
  ...
}
```

---

# 🚀 الأوامر والتشغيل

## تثبيت المشروع

```bash
# 1️⃣ الدخول لمجلد المشروع
cd pirate-store-backend

# 2️⃣ تثبيت المكتبات
npm install

# 3️⃣ إنشاء ملف .env وإضافة:
# PORT=5000
# MONGO_URL=mongodb+srv://username:password@cluster...
# JWT_SECRET=your-secret-key-here-very-secret
```

## تشغيل المشروع

```bash
# في وضع الإنتاج
npm start

# في وضع التطوير (مع إعادة تشغيل تلقائي عند التغيير)
npm run dev
```

## اختبار الـ APIs (باستخدام Postman)

### 1️⃣ التسجيل
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "أحمد",
  "email": "ahmed@test.com",
  "password": "Password123!"
}
```

### 2️⃣ الدخول
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "ahmed@test.com",
  "password": "Password123!"
}
```
**قم بنسخ التوكن من الرد**

### 3️⃣ عرض المنتجات
```
GET http://localhost:5000/api/products
Authorization: Bearer [TOKEN_HERE]
```

---

## 📋 ملخص HTTP Status Codes

| الكود | الاسم | المعنى |
|-----|-------|--------|
| **200** | OK | العملية نجحت |
| **201** | Created | تم الإنشاء بنجاح |
| **400** | Bad Request | البيانات خاطئة أو ناقصة |
| **401** | Unauthorized | غير مخول (بدون توكن أو بدون تسجيل دخول) |
| **403** | Forbidden | ممنوع (لا صلاحيات)  |
| **404** | Not Found | غير موجود |
| **500** | Internal Server Error | خطأ في السيرفر |

---

## 🎯 الخلاصة

**مشروعك يتضمن:**
1. 📱 **نظام مستخدمين** متكامل مع أمان عالي (bcrypt + JWT)
2. 📦 **نظام منتجات** بسيط وفعال
3. 🛒 **نظام طلبات** متقدم مع حساب أسعار وتتبع الحالة
4. 🔐 **نظام حماية** بـ Middleware والتحقق من الصلاحيات
5. 🗄️ **قاعدة بيانات** MongoDB مع علاقات بين الجداول

**أنت على المسار الصحيح تماماً! استمر! 🚀**
