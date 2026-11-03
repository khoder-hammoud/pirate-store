# 🗺️ خريطة سريعة: Mongoose vs Prisma

## 📍 أماكن الفروقات الرئيسية

```
┌─────────────────────────────────────────────────────────────────┐
│  1️⃣ الاستيراد والاتصال (البداية)                              │
├─────────────────────────────────────────────────────────────────┤
│ ❌ const mongoose = require('mongoose');                        │
│ ❌ await mongoose.connect(MONGO_URL);                           │
│                                                                  │
│ ✅ const { PrismaClient } = require('@prisma/client');         │
│ ✅ const prisma = new PrismaClient();                           │
│ ✅ await prisma.$connect();                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2️⃣ إنشاء نموذج (Model)                                        │
├─────────────────────────────────────────────────────────────────┤
│ ❌ const user = new User({...});                                │
│ ❌ await user.save();                                           │
│                                                                  │
│ ✅ const user = await prisma.user.create({                    │
│ ✅   data: {...}                                               │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3️⃣ البحث عن سجل واحد                                          │
├─────────────────────────────────────────────────────────────────┤
│ ❌ User.findById(id)                                            │
│ ❌ User.findOne({email: "test@test.com"})                      │
│                                                                  │
│ ✅ prisma.user.findUnique({where: {id}})                      │
│ ✅ prisma.user.findUnique({where: {email}})                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4️⃣ البحث عن عدة سجلات                                         │
├─────────────────────────────────────────────────────────────────┤
│ ❌ User.find({role: "admin"})                                   │
│ ❌ User.countDocuments({role: "admin"})                         │
│                                                                  │
│ ✅ prisma.user.findMany({where: {role: "admin"}})             │
│ ✅ prisma.user.count({where: {role: "admin"}})                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5️⃣ التحديث                                                     │
├─────────────────────────────────────────────────────────────────┤
│ ❌ user.name = "Ahmed"; await user.save();                      │
│ ❌ User.findByIdAndUpdate(id, {name: "Ahmed"})                 │
│                                                                  │
│ ✅ prisma.user.update({                                        │
│ ✅   where: {id},                                              │
│ ✅   data: {name: "Ahmed"}                                     │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6️⃣ الحذف                                                       │
├─────────────────────────────────────────────────────────────────┤
│ ❌ User.findByIdAndDelete(id)                                   │
│                                                                  │
│ ✅ prisma.user.delete({where: {id}})                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  7️⃣ Transactions (العمليات الجماعية)                           │
├─────────────────────────────────────────────────────────────────┤
│ ❌ const session = await mongoose.startSession();               │
│ ❌ session.startTransaction();                                  │
│ ❌ // مع كل عملية: .session(session)                           │
│ ❌ await session.commitTransaction();                           │
│ ❌ // في الخطأ: session.abortTransaction();                    │
│                                                                  │
│ ✅ await prisma.$transaction(async (tx) => {                   │
│ ✅   // جميع العمليات هنا، بدون session                        │
│ ✅   await tx.order.update({...});                            │
│ ✅   await tx.product.update({...});                          │
│ ✅   // التأكيد والإلغاء أتوماتيكي                            │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  8️⃣ العمليات الرياضية (Increment/Decrement)                   │
├─────────────────────────────────────────────────────────────────┤
│ ❌ Product.updateOne(                                           │
│ ❌   {_id: id},                                                 │
│ ❌   {$inc: {stock: -5}}                                        │
│ ❌ );                                                           │
│                                                                  │
│ ✅ prisma.product.update({                                     │
│ ✅   where: {id},                                              │
│ ✅   data: {stock: {decrement: 5}}                            │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  9️⃣ الـ Select (اختيار الحقول)                                 │
├─────────────────────────────────────────────────────────────────┤
│ ❌ User.find().select('-password')                              │
│    // استثناء password                                        │
│                                                                  │
│ ✅ prisma.user.findMany({                                     │
│ ✅   select: {                                                 │
│ ✅     id: true,                                               │
│ ✅     name: true,                                             │
│ ✅     email: true                                             │
│ ✅     // password لن يُرحَع                                  │
│ ✅   }                                                         │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔟 الـ Populate/Include (العلاقات)                             │
├─────────────────────────────────────────────────────────────────┤
│ ❌ Refund.findById(id)                                          │
│ ❌   .populate('order')                                         │
│ ❌   .populate('user', 'name email');                           │
│                                                                  │
│ ✅ prisma.refund.findUnique({                                  │
│ ✅   where: {id},                                              │
│ ✅   include: {                                                │
│ ✅     order: true,                                            │
│ ✅     user: {                                                 │
│ ✅       select: {name: true, email: true}                    │
│ ✅     }                                                       │
│ ✅   }                                                         │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1️⃣1️⃣ الترتيب (Sort)                                            │
├─────────────────────────────────────────────────────────────────┤
│ ❌ Order.find().sort({createdAt: -1})                           │
│                                                                  │
│ ✅ prisma.order.findMany({                                     │
│ ✅   orderBy: {createdAt: 'desc'}                             │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1️⃣2️⃣ Pagination (الصفحات)                                      │
├─────────────────────────────────────────────────────────────────┤
│ ❌ User.find()                                                  │
│ ❌  .skip(10)                                                   │
│ ❌  .limit(5);                                                  │
│                                                                  │
│ ✅ prisma.user.findMany({                                     │
│ ✅   skip: 10,                                                 │
│ ✅   take: 5                                                   │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1️⃣3️⃣ الـ Aggregation (التجميع)                                 │
├─────────────────────────────────────────────────────────────────┤
│ ❌ Refund.aggregate([                                           │
│ ❌   {$group: {_id: '$status', count: {$sum: 1}}}             │
│ ❌ ]);                                                          │
│                                                                  │
│ ✅ prisma.refund.groupBy({                                    │
│ ✅   by: ['status'],                                          │
│ ✅   _count: {id: true}                                       │
│ ✅ });                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 الفروقات الرئيسية في 30 ثانية

| المبدأ | Mongoose | Prisma |
|------|----------|--------|
| **نموذج البيانات** | MongoDB Document | SQL Database |
| **البحث** | `.find()`, `.findById()` | `.findMany()`, `.findUnique()` |
| **الإنشاء** | `new Model().save()` | `.create()` |
| **التحديث** | `.save()` or `.findByIdAndUpdate()` | `.update()` |
| **الحذف** | `.findByIdAndDelete()` | `.delete()` |
| **Transactions** | معقد (session) | بسيط ($transaction) ✨ |
| **العلاقات** | `.populate()` | `.include()` |
| **Type Safety** | ضعيف | قوي ✨ |
| **الأداء** | جيد | أفضل ✨ |
| **الاستخدام** | `user._id` | `user.id` |

---

## 📍 أماكن التغيير في الملفات

### في `authMiddleware`:
```
السطر 16 (Mongoose) → السطر 18-21 (Prisma)
// User.findById() → prisma.user.findUnique()
```

### في `userService`:
```
السطر 9    (Mongoose) → السطر 12    (Prisma) | findOne()
السطر 14   (Mongoose) → السطر 19    (Prisma) | create()
السطر 33   (Mongoose) → السطر 55    (Prisma) | login findOne()
السطر 52   (Mongoose) → السطر 82    (Prisma) | findById()
السطر 70   (Mongoose) → السطر 109   (Prisma) | update()
السطر 89   (Mongoose) → السطر 129   (Prisma) | getAllUsers()
```

### في `productService`:
```
السطر 8-10 (Mongoose) → السطر 15-18 (Prisma) | create()
السطر 21-30 (Mongoose) → السطر 37-54 (Prisma) | getAllProducts()
السطر 45   (Mongoose) → السطر 68    (Prisma) | findById()
السطر 61   (Mongoose) → السطر 83    (Prisma) | update()
السطر 87   (Mongoose) → السطر 108   (Prisma) | delete()
```

### في `orderService`:
```
السطر 20   (Mongoose) → السطر 21    (Prisma) | findById للمنتج
السطر 76   (Mongoose) → السطر 72    (Prisma) | create order
السطر 103  (Mongoose) → السطر 104   (Prisma) | findMany
السطر 111  (Mongoose) → السطر 113   (Prisma) | findById
السطر 140-194 (Mongoose) → السطر 133-195 (Prisma) | Transactions ⭐
السطر 162  (Mongoose) → السطر 160   (Prisma) | updateOne → update
```

### في `refundService`:
```
السطر 7-12 (Mongoose) → السطر 9-17  (Prisma) | create()
السطر 23   (Mongoose) → السطر 29    (Prisma) | findById()
السطر 55   (Mongoose) → السطر 72    (Prisma) | retryCount increment
السطر 85-87 (Mongoose) → السطر 118-123 (Prisma) | populate() → include()
السطر 97-98 (Mongoose) → السطر 137-145 (Prisma) | findMany مع include
السطر 106-114 (Mongoose) → السطر 152-160 (Prisma) | aggregate → groupBy
```

---

## 🔄 خريطة التدفق

```
┌──────────────────────────┐
│  استلام Request          │
└────────┬─────────────────┘
         │
    ┌────v─────────────────────────────────┐
    │  Controller                          │
    │  (userController, productController) │
    └────┬──────────────────────────────────┘
         │
    ┌────v────────────────────────────────────────────┐
    │  Middleware (authMiddleware.prisma.js)          │
    │  ✅ التحقق من Token و User                     │
    │  ❌ await User.findById()                       │
    │  ✅ await prisma.user.findUnique()             │
    └────┬─────────────────────────────────────────────┘
         │
    ┌────v────────────────────────────────────────────┐
    │  Service (userService.prisma.js)                │
    │  ✅ await prisma.user.findMany()               │
    │  ✅ await prisma.user.create()                 │
    │  ✅ await prisma.user.update()                 │
    │  ✅ await prisma.$transaction()                 │
    └────┬────────────────────────────────────────────┘
         │
    ┌────v─────────────────────────────────────┐
    │  Database (PostgreSQL)                   │
    │  ✅ Queries معقدة وآمنة                 │
    └────┬──────────────────────────────────────┘
         │
    ┌────v──────────────────┐
    │  Response JSON        │
    └───────────────────────┘
```

---

## 🎓 الخطة الموصى بها

```
اليوم/الجلسة 1:
├─ اقرأ MIGRATION_GUIDE.md
├─ اقرأ هذا الملف
└─ قارن ملفين معاً

اليوم/الجلسة 2:
├─ عدّل server.js
├─ عدّل صورة واحدة (userController)
└─ اختبر الـ endpoints

اليوم/الجلسة 3:
├─ عدّل باقي Controllers
├─ اختبر جميع الـ endpoints
└─ تأكد من Transactions تعمل

اليوم/الجلسة 4:
├─ احذف الملفات القديمة
├─ أعد تسمية الملفات الجديدة
└─ تأكد من لا شيء انكسر
```

---

**تذكر:** Prisma أقوى وأأماناً بكثير! 🚀
