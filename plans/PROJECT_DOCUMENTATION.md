# توثيق شامل لمشروع Pirate Store Backend

## جدول المحتويات

1. [مقدمة عامة عن المشروع](#مقدمة-عامة-عن-المشروع)
2. [هيكل المشروع](#هيكل-المشروع)
3. [المكتبات والأدوات المستخدمة](#المكتبات-والأدوات-المستخدمة)
4. [قاعدة البيانات](#قاعدة-البيانات)
5. [نماذج البيانات (Models)](#نماذج-البيانات-models)
6. [واجهات برمجة التطبيقات (API Endpoints)](#واجهات-برمجة-التطبيقات-api-endpoints)
7. [الـ Middleware](#الـ-middleware)
8. [الأمان والتحقق](#الأمان-والتأكد)
9. [الميزات الرئيسية](#الميزات-الرئيسية)
10. [متغيرات البيئة](#متغيرات-البيئة)
11. [كيفية التشغيل](#كيفية-التشغيل)

---

## مقدمة عامة عن المشروع

**Pirate Store Backend** هو نظام backend لمتجر إلكتروني متكامل يستخدم **Node.js** مع **Express.js** كإطار عمل و **MongoDB** كقاعدة بيانات. يوفر النظام مجموعة كاملة من واجهات برمجة التطبيقات (APIs) لإدارة المنتجات، المستخدمين، والطلبات مع نظام مصادقة قوي يعتمد على **JWT** (JSON Web Tokens).

### نوع المشروع
- **تجارة إلكترونية** (E-commerce Backend API)
- **RESTful API** يتبع معايير التصميم التقليدية

### التقنيات الأساسية
| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| Node.js | - | بيئة تشغيل JavaScript |
| Express.js | ^5.2.1 | إطار عمل ويب |
| MongoDB | - | قاعدة بيانات NoSQL |
| Mongoose | ^9.2.1 | مكتبة ODM |

---

## هيكل المشروع

```
pirate-store-backend/
├── config/
│   └── db.js                 # إعداد الاتصال بقاعدة البيانات
├── controllers/
│   ├── userController.js     # منطق عمليات المستخدمين
│   ├── productController.js  # منطق عمليات المنتجات
│   └── OrderController.js    # منطق عمليات الطلبات
├── middleware/
│   └── authMiddleware.js     #middleware المصادقة والحماية
├── models/
│   ├── User.js               # نموذج المستخدم
│   ├── Product.js            # نموذج المنتج
│   └── Order.js              # نموذج الطلب
├── routes/
│   ├── userRoutes.js         # مسارات المستخدمين
│   ├── productRoutes.js     # مسارات المنتجات
│   └── orderRoutes.js       # مسارات الطلبات
├── utils/
│   └── generateToken.js      # دالة توليد JWT
├── .env                      # متغيرات البيئة
├── package.json              # تبعيات المشروع
└── server.js                 # نقطة الدخول الرئيسية
```

---

## المكتبات والأدوات المستخدمة

### التبعيات الإنتاجية (Dependencies)

| المكتبة | الإصدار | الغرض |
|---------|---------|-------|
| **express** | ^5.2.1 | إطار عمل ويب لبناء التطبيقات |
| **mongoose** | ^9.2.1 | مكتبة ORM للتعامل مع MongoDB |
| **cors** | ^2.8.6 | تمكين Cross-Origin Resource Sharing |
| **dotenv** | ^17.3.1 | إدارة متغيرات البيئة |
| **bcryptjs** | ^2.4.3 | تشفير كلمات المرور (Hashing) |
| **jsonwebtoken** | ^9.0.2 | إنشاء والتحقق من JWT tokens |
| **slugify** | ^1.6.6 | توليد slug للسيو (SEO) |

### تبعيات التطوير (DevDependencies)

| المكتبة | الإصدار | الغرض |
|---------|---------|-------|
| **nodemon** | ^3.1.11 | إعادة تشغيل السيرفر تلقائياً عند التغيير |

---

## قاعدة البيانات

### نوع قاعدة البيانات
- **MongoDB** (NoSQL)
- **MongoDB Atlas** - خدمة سحابية للاستضافة

### عنوان الاتصال
```
mongodb+srv://khoderhammoud43_db_user:7zG0m95Ced8GOV71@cluster0.b9cjieb.mongodb.net/pirate-store?retryWrites=true&w=majority
```

### اسم قاعدة البيانات
- **pirate-store**

### طريقة الاتصال
- تستخدم الدالة `connectDB()` في `config/db.js`
- تستخدم `mongoose.connect()` للاتصال
- مع معالجة الأخطاء وإظهار رسالة نجاح/فشل في وحدة التحكم

---

## نماذج البيانات (Models)

### 1. نموذج المستخدم (User Model)

**الملف:** `models/User.js`

#### الحقول
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| name | String | نعم | اسم المستخدم |
| email | String | نعم | البريد الإلكتروني (فريد) |
| password | String | نعم | كلمة المرور المشفرة |
| role | String | لا | دور المستخدم (user/admin) |

#### التحقق (Validation)
- **name:** مطلوب، يُزال whitespace
- **email:** مطلوب، فريد، يُحوّل لحروف صغيرة
- **password:** 
  - مطلوب
  - الحد الأدنى 6 أحرف
  - يجب أن يحتوي: حرف كبير، حرف صغير، رقم، رمز خاص
  - التعبير المنتظم: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$`

#### الميثود (Methods)
- `comparePassword(enteredPassword)` - مقارنة كلمة المرور المُدخلة مع المشفرة

#### الـ Hooks
- `pre('save')` - تشفير كلمة المرور تلقائياً قبل الحفظ

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { 
    type: String, 
    required: true, 
    minlength: 6,
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, 'كلمة المرور ضعيفة جداً!']
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
```

---

### 2. نموذج المنتج (Product Model)

**الملف:** `models/Product.js`

#### الحقول
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| name | String | نعم | اسم المنتج |
| description | String | نعم | وصف المنتج |
| price | Number | نعم | سعر المنتج |
| category | String | نعم | فئة المنتج |
| countInStock | Number | نعم | الكمية المتوفرة |
| image | String | نعم | رابط الصورة |
| rating | Number | لا | التقييم (افتراضي: 0) |
| numReviews | Number | لا | عدد التقييمات (افتراضي: 0) |

#### المميزات
- يستخدم `slugify` لتوليد slug (مستعد للاستخدام المستقبلي)
- يحتوي على `timestamps` (createdAt, updatedAt)

```javascript
const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Product name is required"], trim: true },
  description: { type: String, required: [true, "Product description is required"] },
  price: { type: Number, required: [true, "Product price is required"], default: 0 },
  category: { type: String, required: [true, "Product category is required"] },
  countInStock: { type: Number, required: [true, "Stock count is required"], default: 0 },
  image: { type: String, required: [true, "Product image is required"] },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });
```

---

### 3. نموذج الطلب (Order Model)

**الملف:** `models/Order.js`

#### الحقول الرئيسية
| الحقل | النوع | مطلوب | الوصف |
|-------|------|-------|-------|
| invoiceNumber | String | نعم | رقم الفاتورة (فريد) |
| user | ObjectId | نعم | مرجع للمستخدم |
| orderItems | Array | نعم | عناصر الطلب |
| shippingAddress | Object | نعم | عنوان الشحن |
| itemsPrice | Number | نعم | سعر العناصر |
| taxAmount | Number | نعم | ضريبة القيمة المضافة (15%) |
| shippingPrice | Number | نعم | تكلفة الشحن |
| discountAmount | Number | نعم | قيمة الخصم |
| totalPrice | Number | نعم | السعر الإجمالي |
| status | String | لا | حالة الطلب |
| isPaid | Boolean | لا | هل تم الدفع |
| paidAt | Date | لا | تاريخ الدفع |
| isDelivered | Boolean | لا | هل تم التوصيل |
| deliveredAt | Date | لا | تاريخ التوصيل |
| isDeleted | Boolean | لا | حذف ناعم (Soft Delete) |
| deletedAt | Date | لا | تاريخ الحذف |

#### هيكل orderItems
```javascript
orderItems: [{
  product: { type: ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },      // Snapshot
  price: { type: Number, required: true },     // Snapshot
  quantity: { type: Number, required: true },
  image: { type: String, required: true }      // Snapshot
}]
```

#### هيكل shippingAddress
```javascript
shippingAddress: {
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String },
  phone: { type: String }
}
```

#### حالات الطلب (Status Enum)
- `pending` - معلق (افتراضي)
- `paid` - مدفوع
- `shipped` - مُشحن
- `delivered` - مُسلّم
- `cancelled` - ملغى
- `refunded` - مسترد

#### الـ Indexes
```javascript
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
```

---

## واجهات برمجة التطبيقات (API Endpoints)

### المسارات الأساسية

| المسار الأساسي | الوصف |
|---------------|-------|
| `/api/users` | عمليات المستخدمين |
| `/api/products` | عمليات المنتجات |
| `/api/orders` | عمليات الطلبات |
| `/` | نقطة الوصول الرئيسية |

---

### 1. مسارات المستخدمين (`/api/users`)

#### 注册 مستخدم جديد
- **الطريقة:** `POST /api/users/register`
- **الحماية:** مفتوح
- **الـ Request Body:**
```json
{
  "name": "اسم المستخدم",
  "email": "email@example.com",
  "password": "Password123!"
}
```
- **الـ Response:**
```json
{
  "_id": "...",
  "name": "اسم المستخدم",
  "email": "email@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### تسجيل الدخول
- **الطريقة:** `POST /api/users/login`
- **الحماية:** مفتوح
- **الـ Request Body:**
```json
{
  "email": "email@example.com",
  "password": "Password123!"
}
```
- **الـ Response:**
```json
{
  "_id": "...",
  "name": "اسم المستخدم",
  "email": "email@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### الحصول على بيانات المستخدم الحالي
- **الطريقة:** `GET /api/users/profile`
- **الحماية:** مطلوب توكن (Protect)
- **الـ Response:**
```json
{
  "_id": "...",
  "name": "اسم المستخدم",
  "email": "email@example.com",
  "role": "user"
}
```

#### تحديث بيانات المستخدم الحالي
- **الطريقة:** `PUT /api/users/profile`
- **الحماية:** مطلوب توكن (Protect)
- **الـ Request Body:**
```json
{
  "name": "الاسم الجديد",
  "email": "email@new.com",
  "password": "NewPassword123!"
}
```

#### الحصول على جميع المستخدمين
- **الطريقة:** `GET /api/users`
- **الحماية:** مطلوب توكن + دور أدمن

#### حذف مستخدم
- **الطريقة:** `DELETE /api/users/:id`
- **الحماية:** مطلوب توكن + دور أدمن

---

### 2. مسارات المنتجات (`/api/products`)

#### الحصول على جميع المنتجات
- **الطريقة:** `GET /api/products`
- **الحماية:** مطلوب توكن

#### إنشاء منتج جديد
- **الطريقة:** `POST /api/products`
- **الحماية:** مطلوب توكن + دور أدمن
- **الـ Request Body:**
```json
{
  "name": "اسم المنتج",
  "description": "وصف المنتج",
  "price": 100,
  "category": "electronics",
  "countInStock": 50,
  "image": "http://example.com/image.jpg"
}
```

#### الحصول على منتج واحد
- **الطريقة:** `GET /api/products/:id`
- **الحماية:** مطلوب توكن

#### تحديث منتج معين
- **الطريقة:** `PUT /api/products/:id`
- **الحماية:** مطلوب توكن + دور أدمن

#### تحديث جميع المنتجات
- **الطريقة:** `PUT /api/products`
- **الحماية:** مطلوب توكن + دور أدمن

#### حذف منتج معين
- **الطريقة:** `DELETE /api/products/:id`
- **الحماية:** مطلوب توكن + دور أدمن

#### حذف جميع المنتجات
- **الطريقة:** `DELETE /api/products`
- **الحماية:** مطلوب توكن + دور أدمن

---

### 3. مسارات الطلبات (`/api/orders`)

#### إنشاء طلب جديد
- **الطريقة:** `POST /api/orders`
- **الحماية:** مطلوب توكن
- **الـ Request Body:**
```json
{
  "orderItems": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "العنوان",
    "city": "المدينة",
    "postalCode": "الرمز البريدي",
    "country": "البلد",
    "phone": "رقم الهاتف"
  }
}
```
- **حساب السعر تلقائياً:**
  - taxRate: 15%
  - shippingPrice: 10
  - discountRate: 0%

#### الحصول على طلبات المستخدم الحالي
- **الطريقة:** `GET /api/orders/myorders`
- **الحماية:** مطلوب توكن

#### الحصول على طلب واحد
- **الطريقة:** `GET /api/orders/:id`
- **الحماية:** مطلوب توكن
- **ملاحظة:** يمكن لصاحب الطلب أو الأدمن فقط

#### حذف طلب (Soft Delete)
- **الطريقة:** `DELETE /api/orders/:id`
- **الحماية:** مطلوب توكن + دور أدمن
- **ملاحظة:** حذف ناعم - لا يُحذف نهائياً

#### تحديث حالة الطلب إلى مدفوع
- **الطريقة:** `PUT /api/orders/:id/pay`
- **الحماية:** مطلوب توكن
- **الميزات:**
  - يستخدم MongoDB Transactions
  - يخفض المخزون تلقائياً (Atomic)
  - يمنع إعادة الدفع

#### تحديث حالة الطلب إلى مُسلّم
- **الطريقة:** `PUT /api/orders/:id/deliver`
- **الحماية:** مطلوب توكن + دور أدمن

---

## الـ Middleware

### 1. protect (المصادقة)

**الملف:** `middleware/authMiddleware.js`

#### الوظيفة
حماية المسارات بحيث تتطلب توكن JWT صالح

#### الطريقة
1. استخراج التوكن من header `Authorization: Bearer <token>`
2. التحقق من صحة التوكن باستخدام `jwt.verify`
3. جلب بيانات المستخدم من قاعدة البيانات
4. إضافة المستخدم إلى `req.user`

```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

---

### 2. admin (التحقق من الأدمن)

**الملف:** `middleware/authMiddleware.js`

#### الوظيفة
السماح للأدمن فقط بالوصول للمسار

```javascript
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
```

---

## الأمان والتحقق

### 1. تشفير كلمات المرور
- يستخدم **bcryptjs** للتشفير
- يستخدم **Salt** معامل 10
- التشفير يحدث تلقائياً في `pre('save')` hook

### 2. قوة كلمة المرور
- الحد الأدنى: 8 أحرف
- يجب أن تحتوي على:
  - حرف كبير (A-Z)
  - حرف صغير (a-z)
  - رقم (0-9)
  - رمز خاص (!@#$%^&*)

### 3. التوكن (JWT)
- مدة الانتهاء: 30 يوم
- يعتمد على `JWT_SECRET` من متغيرات البيئة
- يُستخدم `generateToken` في `utils/generateToken.js`

### 4. حماية المسارات
- مسارات Products محمية وتحدد الأدمن
- مسارات Orders محمية وتحدد المستخدم صاحب الطلب
- مسارات Users محمية وتحدد الأدمن (القراءة/الحذف)

### 5. منع User Enumeration
- رسالة خطأ موحدة عند فشل تسجيل الدخول
- لا تكشف إذا كان البريد الإلكتروني موجوداً

---

## الميزات الرئيسية

### 1. نظام المصادقة
- تسجيل مستخدم جديد مع التحقق من البيانات
- تسجيل دخول وإصدار توكن JWT
- تحديث بيانات المستخدم

### 2. إدارة المنتجات
- إنشاء، قراءة، تحديث، حذف المنتجات
- التحقق من المخزون
- تصنيف المنتجات

### 3. نظام الطلبات المتقدم
- **إنشاء طلب:** مع حساب تلقائي للضرائب والشحن
- **Soft Delete:** حذف غير نهائي للاحتفاظ بالبيانات
- **Transactions:** ضمان اتمافية العمليات
- **تحديث المخزون:** خصم تلقائي عند الدفع
- **تتبع الحالة:** من معلق إلى مدفوع إلى مُسلّم

### 4. نظام الأدوار
- **User:** مستخدم عادي
- **Admin:** مدير النظام

### 5. رقم الفاتورة الفريد
- يتولد تلقائياً: `INV-<timestamp>`
- مثال: `INV-1699123456789`

---

## متغيرات البيئة

**الملف:** `.env`

```env
PORT=5000
MONGO_URL=mongodb+srv://khoderhammoud43_db_user:7zG0m95Ced8GOV71@cluster0.b9cjieb.mongodb.net/pirate-store?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123
```

---

## كيفية التشغيل

### 1. التثبيت
```bash
cd pirate-store-backend
npm install
```

### 2. تشغيل السيرفر (وضع التطوير)
```bash
npm run dev
```
- يستخدم **nodemon** لإعادة التشغيل تلقائياً
- يعمل على المنفذ 5000

### 3. تشغيل السيرفر (وضع الإنتاج)
```bash
npm start
```

### 4. الاختبار
- يمكن استخدام Postman أو Thunder Client
- التوكن يُرسل في Header: `Authorization: Bearer <token>`

---

## ملاحظات للتطوير المستقبلي

1. **Frontend:** يمكن ربط هذا الـ Backend مع React, Vue, أو Angular
2. **Payment Gateway:** يمكن إضافة Stripe أو PayPal للدفع
3. **Email:** يمكن إضافة Nodemailer لإرسال رسائل
4. **Validation:** يمكن استخدام express-validator لتحسين التحقق
5. **Error Handling:** يمكن إضافة centralized error handler
6. **Logging:** يمكن إضافة Morgan أو Winston للتسجيل
7. **API Documentation:** يمكن إضافة Swagger

---

## الخاتمة

هذا المشروع يتبع أفضل الممارسات في تطوير APIs باستخدام Node.js و Express و MongoDB. يستخدم نمط MVC (Model-View-Controller) مع فصل واضح بين الطبقات. يتميز بنظام مصادقة قوي، إدارة طلبات متقدمة، وحماية شاملة للمسارات.

**تم إنشاء هذا التوثيق بتاريخ:** 2026-03-05
**إصدار المشروع:** 1.0.0
