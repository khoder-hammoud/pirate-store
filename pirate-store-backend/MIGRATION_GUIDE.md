# 🔄 مقارنة: Mongoose vs Prisma

## 📋 ملخص الملفات الجديدة المُنشأة

تم إنشاء نسخ جديدة من الملفات مع Prisma **دون حذف الملفات القديمة**. يمكنك مقارنة الاثنين:

### ✅ الملفات الجديدة (Prisma)
```
config/db.prisma.js
middleware/authMiddleware.prisma.js
services/userService.prisma.js
services/productService.prisma.js
services/orderService.prisma.js
services/refundService.prisma.js
```

### 📦 الملفات القديمة (Mongoose) - محفوظة كما هي
```
config/db.js
middleware/authMiddleware.js
services/userService.js
services/productService.js
services/orderService.js
services/refundServiceFull.js
```

---

## 🔍 الفروقات الرئيسية

### 1️⃣ **الاتصال بقاعدة البيانات**

#### ❌ Mongoose (القديم)
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
};

module.exports = connectDB;
```

#### ✅ Prisma (الجديد)
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectDB = async () => {
    await prisma.$connect();
    console.log("✅ Prisma connected to PostgreSQL");
    return prisma;
};

module.exports = { prisma, connectDB };
```

**الفرق:** Prisma يدعم PostgreSQL و بيانات قوية من نوع أقوى

---

### 2️⃣ **البحث عن سجل واحد**

#### ❌ Mongoose
```javascript
const user = await User.findById(userId);
const user = await User.findOne({ email: "test@test.com" });
```

#### ✅ Prisma
```javascript
const user = await prisma.user.findUnique({ 
  where: { id: userId } 
});

const user = await prisma.user.findUnique({ 
  where: { email: "test@test.com" } 
});
```

**الفرق:** Prisma يستخدم `findUnique` للمفاتيح الفريدة و `findFirst` للبحث العام

---

### 3️⃣ **البحث عن عدة سجلات**

#### ❌ Mongoose
```javascript
const users = await User.find({ role: 'admin' })
  .sort({ createdAt: -1 })
  .select('-password')
  .skip(10)
  .limit(5);

const count = await User.countDocuments({ role: 'admin' });
```

#### ✅ Prisma
```javascript
const users = await prisma.user.findMany({
  where: { role: 'admin' },
  select: { id: true, name: true, email: true }, // بدل -password
  orderBy: { createdAt: 'desc' },
  skip: 10,
  take: 5
});

const count = await prisma.user.count({
  where: { role: 'admin' }
});
```

**الفرق:** Prisma يستخدم `findMany` بدل `find()` و `select` يجب تحديد الحقول بدل استثناؤها

---

### 4️⃣ **إنشاء سجل**

#### ❌ Mongoose
```javascript
const user = new User({ name: "Ali", email: "ali@test.com" });
await user.save();

// أو
const user = await User.create({ name: "Ali", email: "ali@test.com" });
```

#### ✅ Prisma
```javascript
const user = await prisma.user.create({
  data: { 
    name: "Ali", 
    email: "ali@test.com" 
  }
});
```

**الفرق:** Prisma يستخدم دائماً `create` و `data` wrapper

---

### 5️⃣ **تحديث سجل**

#### ❌ Mongoose
```javascript
user.name = "Ahmed";
await user.save();

// أو
const user = await User.findByIdAndUpdate(
  userId, 
  { name: "Ahmed" },
  { new: true }
);
```

#### ✅ Prisma
```javascript
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: "Ahmed" }
});
```

**الفرق:** Prisma دائماً يرجع السجل المُحدث، لا حاجة للـ `new: true`

---

### 6️⃣ **حذف سجل**

#### ❌ Mongoose
```javascript
await User.findByIdAndDelete(userId);
```

#### ✅ Prisma
```javascript
await prisma.user.delete({
  where: { id: userId }
});
```

---

### 7️⃣ **الـ Transactions (العمليات الذرية)**

#### ❌ Mongoose
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const order = await Order.findById(orderId).session(session);
  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: -1 } },
    { session }
  );
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

#### ✅ Prisma
```javascript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.findUnique({
    where: { id: orderId }
  });
  
  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: 1 } }
  });
  
  // لا حاجة للـ commit/abort - Prisma يتعامل معها أتوماتيكاً
});
```

**الفرق:** Prisma مدمجة مع التسلسلات الذرية بشكل أسهل

---

### 8️⃣ **العمليات الرياضية (increment/decrement)**

#### ❌ Mongoose
```javascript
await Product.updateOne(
  { _id: productId },
  { $inc: { countInStock: -5 } } // decrement
);
```

#### ✅ Prisma
```javascript
await prisma.product.update({
  where: { id: productId },
  data: { 
    countInStock: { decrement: 5 }
  }
});

// أو increment
await prisma.product.update({
  where: { id: productId },
  data: { 
    countInStock: { increment: 5 }
  }
});
```

---

### 9️⃣ **التوسيع والـ Relationships (include)**

#### ❌ Mongoose
```javascript
const refund = await Refund.findById(refundId)
  .populate('order')
  .populate('user', 'name email');
```

#### ✅ Prisma
```javascript
const refund = await prisma.refund.findUnique({
  where: { id: refundId },
  include: {
    order: true,
    user: {
      select: { name: true, email: true }
    }
  }
});
```

---

### 🔟 **الـ Aggregation (التجميع)**

#### ❌ Mongoose
```javascript
const stats = await Refund.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  }
]);
```

#### ✅ Prisma
```javascript
const stats = await prisma.refund.groupBy({
  by: ['status'],
  _count: { id: true },
  _sum: { amount: true }
});

// النتيجة مختلفة قليلاً
stats.forEach(stat => {
  console.log(stat.status, stat._count.id, stat._sum.amount);
});
```

---

## 📝 ملاحظات مهمة

### تحديثات مطلوبة في الملفات الأخرى:

1. **server.js** - تحديث الاتصال
   ```javascript
   // ❌ القديم
   const connectDB = require('./config/db');
   await connectDB();
   
   // ✅ الجديد
   const { connectDB } = require('./config/db.prisma');
   await connectDB();
   ```

2. **Controllers** - تحديث الاستيراد
   ```javascript
   // ❌ القديم
   const userService = require('../services/userService');
   
   // ✅ الجديد
   const userService = require('../services/userService.prisma');
   ```

3. **حذف Models** - لا تحتاج الملفات في `models/` لأن Prisma يستخدم `schema.prisma`

---

## 🎯 الخلاصة

| المميزة | Mongoose | Prisma |
|--------|----------|--------|
| **اللغة** | JavaScript/TypeScript | JavaScript/TypeScript |
| **قاعدة البيانات** | MongoDB | PostgreSQL, MySQL, SQLite, etc |
| **نوع البيانات** | ضعيف | قوي جداً (Type-safe) |
| **الـ Queries** | نمط فضفاض | صارم جداً |
| **الـ Transactions** | معقدة | بسيطة جداً |
| **الأداء** | جيد | أفضل |
| **المتعة في الاستخدام** | متوسطة | عالية جداً ✨ |

---

## 🚀 الخطوات التالية

1. عدّل `server.js` لاستخدام `db.prisma.js`
2. عدّل جميع `controllers/` لاستخدام الـ `.prisma` services
3. عدّل `middleware/authMiddleware.js` أو استخدم `.prisma` النسخة
4. اختبر الـ API مع Postman
5. احذف الملفات القديمة عندما تتأكد أن كل شيء يعمل
