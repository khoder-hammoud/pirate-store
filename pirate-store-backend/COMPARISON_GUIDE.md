# 🔍 دليل سريع للمقارنة بين النسخ

## 📂 بنية المشروع الجديدة

```
pirate-store-backend/
├── config/
│   ├── db.js                    ❌ قديم (Mongoose)
│   └── db.prisma.js             ✅ جديد (Prisma)
│
├── middleware/
│   ├── authMiddleware.js        ❌ قديم (Mongoose)
│   └── authMiddleware.prisma.js ✅ جديد (Prisma)
│
├── services/
│   ├── userService.js           ❌ قديم (Mongoose)
│   ├── userService.prisma.js    ✅ جديد (Prisma)
│   │
│   ├── productService.js        ❌ قديم (Mongoose)
│   ├── productService.prisma.js ✅ جديد (Prisma)
│   │
│   ├── orderService.js          ❌ قديم (Mongoose)
│   ├── orderService.prisma.js   ✅ جديد (Prisma)
│   │
│   ├── refundServiceFull.js     ❌ قديم (Mongoose)
│   └── refundService.prisma.js  ✅ جديد (Prisma)
│
└── MIGRATION_GUIDE.md           📖 دليل الترحيل
```

---

## 🎯 نقاط المقارنة الرئيسية

### 1️⃣ **config/db.js vs config/db.prisma.js**

**السطر الأول - الاستيراد:**
```javascript
// ❌ OLD
const mongoose = require('mongoose');

// ✅ NEW
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

**الاتصال:**
```javascript
// ❌ OLD
await mongoose.connect(process.env.MONGO_URL);

// ✅ NEW
await prisma.$connect();
```

---

### 2️⃣ **authMiddleware.js vs authMiddleware.prisma.js**

**البحث عن المستخدم:**
```javascript
// ❌ OLD (خط 16)
req.user = await User.findById(decoded.id).select('-password');

// ✅ NEW (خط 18-21)
req.user = await prisma.user.findUnique({
  where: { id: decoded.id },
  select: { id: true, name: true, email: true, role: true }
});
```

---

### 3️⃣ **userService.js vs userService.prisma.js**

#### البحث عن مستخدم موجود (التسجيل)
```javascript
// ❌ OLD (خط 9)
const userExists = await User.findOne({ email });

// ✅ NEW (خط 12-14)
const userExists = await prisma.user.findUnique({ 
  where: { email } 
});
```

#### إنشاء مستخدم جديد
```javascript
// ❌ OLD (خط 14)
const user = await User.create({ name, email, password });

// ✅ NEW (خط 21-26)
const user = await prisma.user.create({
  data: { name, email, password }
});
```

#### البحث للـ Login
```javascript
// ❌ OLD (خط 33)
const user = await User.findOne({ email });

// ✅ NEW (خط 55-57)
const user = await prisma.user.findUnique({ 
  where: { email } 
});
```

#### الحصول على الملف الشخصي
```javascript
// ❌ OLD (خط 52)
const user = await User.findById(userId);

// ✅ NEW (خط 82-84)
const user = await prisma.user.findUnique({ 
  where: { id: userId } 
});
```

#### التحديث
```javascript
// ❌ OLD (خط 70-76)
if (updateData.name) user.name = updateData.name;
if (updateData.email) user.email = updateData.email;
// ...
const updatedUser = await user.save();

// ✅ NEW (خط 107-127)
const dataToUpdate = {};
if (updateData.name) dataToUpdate.name = updateData.name;
// ...
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: dataToUpdate
});
```

#### الحصول على جميع المستخدمين
```javascript
// ❌ OLD (لا يوجد في القديم)
const users = await User.find();

// ✅ NEW (خط 129-135)
return await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true, createdAt: true }
});
```

#### الحذف
```javascript
// ❌ OLD (لا يوجد في القديم)
await User.findByIdAndDelete(userId);

// ✅ NEW (خط 141-147)
const user = await prisma.user.delete({
  where: { id: userId }
});
```

---

### 4️⃣ **productService.js vs productService.prisma.js**

#### الإنشاء
```javascript
// ❌ OLD (خط 8-10)
const product = new Product(productData);
return await product.save();

// ✅ NEW (خط 15-18)
const product = await prisma.product.create({
  data: productData
});
```

#### الحصول على جميع المنتجات
```javascript
// ❌ OLD (خط 21-30)
const totalResults = await Product.countDocuments(finalQuery);
const products = await Product.find(finalQuery)
  .sort(sortBy)
  .select(select)
  .skip(skip)
  .limit(limit);

// ✅ NEW (خط 37-54)
const totalResults = await prisma.product.count({
  where: finalQuery
});

const products = await prisma.product.findMany({
  where: finalQuery,
  select: selectObj,
  orderBy: sortBy,
  skip,
  take: limit
});
```

#### البحث بـ ID
```javascript
// ❌ OLD (خط 45)
const product = await Product.findById(productId);

// ✅ NEW (خط 68-70)
const product = await prisma.product.findUnique({
  where: { id: productId }
});
```

#### التحديث
```javascript
// ❌ OLD (خط 61-66)
const product = await Product.findByIdAndUpdate(
  productId, updateData, { new: true }
);

// ✅ NEW (خط 83-88)
const product = await prisma.product.update({
  where: { id: productId },
  data: updateData
});
```

#### الحذف
```javascript
// ❌ OLD (خط 87)
const product = await Product.findByIdAndDelete(productId);

// ✅ NEW (خط 108-111)
const product = await prisma.product.delete({
  where: { id: productId }
});
```

---

### 5️⃣ **orderService.js vs orderService.prisma.js**

#### البحث عن منتج (التحقق)
```javascript
// ❌ OLD (خط 20)
const product = await Product.findById(item.product);

// ✅ NEW (خط 21-24)
const product = await prisma.product.findUnique({
  where: { id: item.productId }
});
```

#### إنشاء الطلب
```javascript
// ❌ OLD (خط 76)
const order = await Order.create({ ... });

// ✅ NEW (خط 72-90)
const order = await prisma.order.create({
  data: { ... }
});
```

#### الحصول على طلبات المستخدم
```javascript
// ❌ OLD (خط 101-104)
return await Order.find({ user: userId, isDeleted: false })
  .sort({ createdAt: -1 });

// ✅ NEW (خط 104-109)
return await prisma.order.findMany({
  where: { userId, isDeleted: false },
  orderBy: { createdAt: 'desc' }
});
```

#### الـ Transactions (الأهم!)
```javascript
// ❌ OLD (خط 140-194) - معقد جداً
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operations with .session(session)
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}

// ✅ NEW (خط 133-195) - بسيط جداً
await prisma.$transaction(async (tx) => {
  // جميع العمليات هنا
  // لا حاجة للـ commit/abort
});
```

#### الحصول على طلب بـ ID مع التحقق
```javascript
// ❌ OLD (خط 112)
const order = await Order.findById(orderId);
// ثم تحقق يدوي من user

// ✅ NEW (خط 113-118)
const order = await prisma.order.findUnique({
  where: { id: orderId }
});
// ثم compare مباشرة: order.userId !== user.id
```

#### تحديث الحالة
```javascript
// ❌ OLD (خط 220-232)
order.isDelivered = true;
order.deliveredAt = new Date();
order.status = 'delivered';
await order.save();

// ✅ NEW (خط 219-226)
const updatedOrder = await prisma.order.update({
  where: { id: orderId },
  data: {
    isDelivered: true,
    deliveredAt: new Date(),
    status: 'delivered'
  }
});
```

#### العمليات الرياضية (Stock Update)
```javascript
// ❌ OLD (خط 162-168)
await Product.updateOne(
  { _id: item.product, countInStock: { $gte: item.quantity } },
  { $inc: { countInStock: -item.quantity } }
);

// ✅ NEW (خط 160-172)
const product = await tx.product.findUnique({...});
await tx.product.update({
  where: { id: item.productId },
  data: {
    countInStock: { decrement: item.quantity }
  }
});
```

---

### 6️⃣ **refundServiceFull.js vs refundService.prisma.js**

#### الإنشاء
```javascript
// ❌ OLD (خط 7-12)
const refund = await Refund.create({
  order: orderId,
  user: userId,
  amount,
  status: 'pending'
});

// ✅ NEW (خط 9-17)
const refund = await prisma.refund.create({
  data: {
    orderId, userId, amount,
    status: 'pending'
  }
});
```

#### البحث والتحديث
```javascript
// ❌ OLD (خط 23)
const refund = await Refund.findById(refundId);

// ✅ NEW (خط 29-32)
const refund = await prisma.refund.findUnique({
  where: { id: refundId }
});
```

#### التحديث مع Increment
```javascript
// ❌ OLD (خط 55)
refund.retryCount += 1;

// ✅ NEW (خط 72-78)
await prisma.refund.update({
  where: { id: refundId },
  data: {
    retryCount: { increment: 1 },
    // ...
  }
});
```

#### الـ Populate (Include)
```javascript
// ❌ OLD (خط 85-87)
const refund = await Refund.findOne({ order: orderId })
  .populate('order')
  .populate('user', 'name email');

// ✅ NEW (خط 118-123)
const refund = await prisma.refund.findFirst({
  where: { orderId },
  include: {
    order: true,
    user: { select: { name: true, email: true } }
  }
});
```

#### الـ FindMany مع Include
```javascript
// ❌ OLD (خط 97-98)
return await Refund.find()
  .populate('order')
  .populate('user', 'name email')
  .sort({ createdAt: -1 });

// ✅ NEW (خط 137-145)
return await prisma.refund.findMany({
  include: {
    order: true,
    user: { select: { name: true, email: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

#### الـ Aggregation
```javascript
// ❌ OLD (خط 106-114)
const stats = await Refund.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  }
]);

// ✅ NEW (خط 152-160)
const stats = await prisma.refund.groupBy({
  by: ['status'],
  _count: { id: true },
  _sum: { amount: true }
});
```

---

## ✨ الخلاصة السريعة

| العملية | Mongoose | Prisma |
|--------|----------|--------|
| البحث الواحد | `findById()` / `findOne()` | `findUnique()` / `findFirst()` |
| البحث المتعدد | `find()` | `findMany()` |
| العد | `countDocuments()` | `count()` |
| الإنشاء | `create()` / `new + save()` | `create()` |
| التحديث | `findByIdAndUpdate()` / `save()` | `update()` |
| الحذف | `findByIdAndDelete()` | `delete()` |
| الـ Transaction | `session()` معقد | `$transaction()` بسيط |
| العمليات الرياضية | `$inc`, `$sum` | `increment`, `decrement`, `_sum` |
| الـ Relationships | `.populate()` | `.include()` |
| الاختيار | `.select('-field')` | `select: { field: true }` |
| الترتيب | `.sort({ field: -1 })` | `orderBy: { field: 'desc' }` |
| Pagination | `.skip().limit()` | `skip, take` |

---

## 🎓 نصيحة للتعلم

1. فتح ملفين بجانب بعضهم (القديم والجديد)
2. قارن السطور المشار إليها أعلاه
3. لاحظ أن Prisma أكثر وضوحاً وأماناً في الأنواع
4. جرب على الملفات الجديدة أولاً قبل حذف القديمة

---

**تم إنشاء هذا الدليل لمساعدتك على فهم الفروقات بشكل عملي وبصري!** 🚀
