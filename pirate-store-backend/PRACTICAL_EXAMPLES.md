# 💻 أمثلة عملية: Mongoose vs Prisma

## مثال 1️⃣: تسجيل مستخدم جديد

### ❌ Mongoose (القديم)
```javascript
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // البحث عن مستخدم موجود
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // إنشاء مستخدم جديد
  const user = await User.create({
    name,
    email,
    password
  });

  // إرجاع البيانات
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  };
};
```

### ✅ Prisma (الجديد)
```javascript
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // البحث عن مستخدم موجود (استخدام findUnique بدل findOne)
  const userExists = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // إنشاء مستخدم جديد
  const user = await prisma.user.create({
    data: {  // ⭐ لاحظ استخدام 'data' wrapper
      name,
      email,
      password
    }
  });

  return {
    id: user.id,  // ⭐ استخدم 'id' بدل '_id'
    name: user.name,
    email: user.email,
    token: generateToken(user.id)
  };
};
```

---

## مثال 2️⃣: جلب جميع المنتجات مع Pagination

### ❌ Mongoose (القديم)
```javascript
const getAllProducts = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // العد الكلي
  const totalResults = await Product.countDocuments({});

  // البحث مع الترتيب والتخطي والحد
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .select('-description')  // ⭐ استثناء الحقول
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalResults / limit);

  return {
    page,
    limit,
    totalResults,
    totalPages,
    products
  };
};
```

### ✅ Prisma (الجديد)
```javascript
const getAllProducts = async (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // العد الكلي
  const totalResults = await prisma.product.count({});

  // البحث مع الترتيب والتخطي والحد
  const products = await prisma.product.findMany({
    skip,        // ⭐ بدل .skip()
    take: limit, // ⭐ بدل .limit()
    orderBy: {   // ⭐ بدل .sort()
      createdAt: 'desc'
    },
    select: {    // ⭐ تحديد الحقول بدل استثناؤها
      id: true,
      name: true,
      price: true,
      image: true,
      countInStock: true
      // لاحظ: حقل 'description' لن يُرحَع
    }
  });

  const totalPages = Math.ceil(totalResults / limit);

  return {
    page,
    limit,
    totalResults,
    totalPages,
    products
  };
};
```

---

## مثال 3️⃣: تحديث حالة الطلب مع Transaction (الأهم!)

### ❌ Mongoose (القديم - معقد!)
```javascript
const updateOrderToPaid = async (orderId, userId) => {
  // ⭐ إنشاء session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ⭐ استخدام .session() في كل عملية
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.isPaid) {
      throw new AppError('Order already paid', 400);
    }

    // تحديث المنتجات
    for (const item of order.orderItems) {
      // ⭐ .session() في كل عملية
      await Product.updateOne(
        { _id: item.product },
        { $inc: { countInStock: -item.quantity } },
        { session }
      );
    }

    // تحديث الطلب
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'paid';

    await order.save({ session: session }); // ⭐ مع session

    // ⭐ التأكيد
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    // ⭐ الإلغاء اليدوي
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
```

### ✅ Prisma (الجديد - بسيط!)
```javascript
const updateOrderToPaid = async (orderId, userId) => {
  // ⭐ $transaction بدل startSession
  return await prisma.$transaction(async (tx) => {
    // ⭐ كل شيء داخل الـ callback
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.isPaid) {
      throw new AppError('Order already paid', 400);
    }

    // تحديث المنتجات - بدون .session()
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          countInStock: { decrement: item.quantity }  // ⭐ decrement
        }
      });
    }

    // تحديث الطلب
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: 'paid'
      }
    });

    // ⭐ بدون commit/abort - Prisma يتعامل معها أتوماتيكاً
    return updatedOrder;
  });
};
```

**ملاحظة:** Prisma معالجة الـ commit/abort تلقائياً! 🎉

---

## مثال 4️⃣: الحصول على المبالغ المسترجعة مع العلاقات

### ❌ Mongoose (القديم)
```javascript
const getAllRefunds = async () => {
  return await Refund.find()
    .populate('order')        // ⭐ populate
    .populate('user', 'name email')  // ⭐ populate مع select
    .sort({ createdAt: -1 });
};
```

### ✅ Prisma (الجديد)
```javascript
const getAllRefunds = async () => {
  return await prisma.refund.findMany({
    include: {           // ⭐ include بدل populate
      order: true,
      user: {
        select: {       // ⭐ select بدل حجة ثانية
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }  // ⭐ بدل .sort()
  });
};
```

---

## مثال 5️⃣: حذف مستخدم

### ❌ Mongoose (القديم)
```javascript
const deleteUserById = async (userId) => {
  // ⭐ findByIdAndDelete
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
```

### ✅ Prisma (الجديد)
```javascript
const deleteUserById = async (userId) => {
  // ⭐ delete
  const user = await prisma.user.delete({
    where: { id: userId }
  });

  // لا حاجة للتحقق - Prisma يرمي error إذا مش موجود
  return user;
};
```

---

## مثال 6️⃣: التحقق من الهوية (Middleware)

### ❌ Mongoose (القديم)
```javascript
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ⭐ findById مع select
      req.user = await User.findById(decoded.id)
        .select('-password');

      next();
    } catch (error) {
      next(error);
    }
  } else {
    return next(new AppError('Not authorized', 401));
  }
};
```

### ✅ Prisma (الجديد)
```javascript
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ⭐ findUnique مع select
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
          // password لن يُرحَع
        }
      });

      if (!req.user) {
        return next(new AppError('User not found', 404));
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    return next(new AppError('Not authorized', 401));
  }
};
```

---

## مثال 7️⃣: العمليات الرياضية (Increment/Decrement)

### ❌ Mongoose (القديم)
```javascript
// إنقاص المخزون
await Product.updateOne(
  { _id: productId },
  { $inc: { countInStock: -5 } }  // ⭐ $inc مع سالب
);

// زيادة المخزون
await Product.updateOne(
  { _id: productId },
  { $inc: { countInStock: 3 } }   // ⭐ $inc مع موجب
);
```

### ✅ Prisma (الجديد)
```javascript
// إنقاص المخزون
await prisma.product.update({
  where: { id: productId },
  data: {
    countInStock: { decrement: 5 }  // ⭐ decrement واضح
  }
});

// زيادة المخزون
await prisma.product.update({
  where: { id: productId },
  data: {
    countInStock: { increment: 3 }  // ⭐ increment واضح
  }
});
```

---

## مثال 8️⃣: الإحصائيات والتجميع

### ❌ Mongoose (القديم)
```javascript
const getRefundStats = async () => {
  // ⭐ aggregate معقد
  const stats = await Refund.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return stats;
};
```

### ✅ Prisma (الجديد)
```javascript
const getRefundStats = async () => {
  // ⭐ groupBy أبسط
  const stats = await prisma.refund.groupBy({
    by: ['status'],
    _count: { id: true },        // count
    _sum: { amount: true }       // total
  });

  return stats;
};
```

---

## مثال 9️⃣: تحديث مشروط

### ❌ Mongoose (القديم)
```javascript
const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // ⭐ تحديث يدوي
  if (updateData.name) user.name = updateData.name;
  if (updateData.email) user.email = updateData.email;

  const updatedUser = await user.save();

  return updatedUser;
};
```

### ✅ Prisma (الجديد)
```javascript
const updateUserProfile = async (userId, updateData) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // ⭐ تحديث بدل تعديل يدوي
  const dataToUpdate = {};
  if (updateData.name) dataToUpdate.name = updateData.name;
  if (updateData.email) dataToUpdate.email = updateData.email;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  });

  return updatedUser;
};
```

---

## مثال 🔟: البحث المتقدم (Where Conditions)

### ❌ Mongoose (القديم)
```javascript
const getActiveOrders = async (userId) => {
  // ⭐ MongoDB operators معقدة
  const orders = await Order.find({
    user: userId,
    status: { $in: ['pending', 'paid', 'shipped'] },
    isDeleted: false,
    createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
  });

  return orders;
};
```

### ✅ Prisma (الجديد)
```javascript
const getActiveOrders = async (userId) => {
  // ⭐ SQL-like syntax أوضح
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: {
        in: ['pending', 'paid', 'shipped']  // ⭐ in بدل $in
      },
      isDeleted: false,
      createdAt: {
        gte: new Date(Date.now() - 30*24*60*60*1000)  // ⭐ gte بدل $gte
      }
    }
  });

  return orders;
};
```

---

## نصائح ذهبية ✨

1. **استخدم `where` دائماً في Prisma:** أكثر وضوحاً من MongoDB syntax
2. **استخدم `$transaction` للعمليات الجماعية:** أسهل من sessions
3. **استخدم `select` للحقول:** أوضح من exclude
4. **استخدم `increment`/`decrement`:** أسهل من `$inc`
5. **استخدم `include` للعلاقات:** أوضح من `.populate()`

---

**جميع هذه الأمثلة موجودة في الملفات `.prisma.js`!** 🎉
