# 📚 دليل الاستخدام - كل Service بالتفصيل

## 🎯 orderService.js

### 1️⃣ Create Order
```javascript
// استدعاء من Controller
const order = await orderService.createOrder(userId, {
  orderItems: [
    { product: "6505abc123", quantity: 2 }
  ],
  shippingAddress: "123 Main St, Palestine"
});
```

**ماذا يفعل Service:**
- ✅ يفحص orderItems موجودة
- ✅ يفحص كل منتج موجود في DB
- ✅ يفحص المخزون كافي
- ✅ يحسب السعر + الضرائب + الشحن
- ✅ ينشئ الأوردر في DB

**أخطاء محتملة:**
- "Order items are required"
- "Shipping address is required"
- "Product not found: 6505abc123"
- "Insufficient stock for product: Samsung"

---

### 2️⃣ Get User Orders
```javascript
const orders = await orderService.getUserOrders(userId);
// Returns: [{ _id, status, totalPrice, ... }]
```

---

### 3️⃣ Get Order By ID
```javascript
const order = await orderService.getOrderById(orderId, req.user);
// تفحص تلقائياً: هل المستخدم صاحب الأوردر أو Admin؟
```

**أخطاء محتملة:**
- "Order not found"
- "Not authorized"

---

### 4️⃣ Update Order to Paid
```javascript
const order = await orderService.updateOrderToPaid(orderId, req.user);
```

**ماذا يفعل:**
- ✅ فحص الأوردر موجود
- ✅ فحص المستخدم مصرح
- ✅ فحص الأوردر ما مدفوع مسبقاً
- ✅ فحص State Transition صحيح
- ✅ تحديث المخزون (Atomic - جميع العناصر أو لا شيء)
- ✅ تحديث الأوردر

**أخطاء محتملة:**
- "Order not found"
- "Not authorized"
- "Order already paid"
- "Invalid status transition"
- "Insufficient stock"

---

### 5️⃣ Update Order to Delivered (Admin)
```javascript
const order = await orderService.updateOrderToDelivered(orderId, req.user);
```

**فحوصات:**
- ✅ الأوردر موجود
- ✅ المستخدم Admin
- ✅ الأوردر مدفوع
- ✅ ما تم توصيله مسبقاً
- ✅ State transition صحيح

---

### 6️⃣ Cancel Order (User)
```javascript
const order = await orderService.cancelOrder(orderId, req.user);
```

**ماذا يفعل:**
- ✅ فحص الأوردر موجود
- ✅ فحص التصريح (صاحب الأوردر أو Admin)
- ✅ فحص الناتجة في 15 دقيقة (للمستخدمين العاديين)
- ✅ استرجاع المخزون
- ✅ وضع علامة الحذف
- ✅ إنشاء Refund إذا كان مدفوع

**أخطاء محتملة:**
- "Order not found"
- "Not authorized"
- "Order already cancelled"
- "Cancel window expired" (أكثر من 15 دقيقة)
- "Invalid status transition"

---

## 🎯 productService.js

### 1️⃣ Create Product (Admin)
```javascript
const product = await productService.createProduct({
  name: "iPhone 14",
  description: "Apple iPhone 14",
  price: 999,
  category: "electronics",
  countInStock: 50,
  image: "https://..."
});
```

---

### 2️⃣ Get All Products
```javascript
const products = await productService.getAllProducts();
// Returns: [{ _id, name, price, ... }]
```

---

### 3️⃣ Get Product by ID
```javascript
const product = await productService.getProductById("6505abc123");
```

**أخطاء محتملة:**
- "المنتج غير موجود"

---

### 4️⃣ Update Product by ID (Admin)
```javascript
const product = await productService.updateProductById(productId, {
  price: 1099,
  countInStock: 30
});
```

---

### 5️⃣ Update All Products (Admin)
```javascript
const result = await productService.updateAllProducts({
  price: 100  // تحديث سعر جميع المنتجات
});
// Returns: { modifiedCount: 15 }
```

---

### 6️⃣ Delete Product by ID (Admin)
```javascript
const deletedProduct = await productService.deleteProductById(productId);
```

---

### 7️⃣ Delete All Products (Admin)
```javascript
const result = await productService.deleteAllProducts();
// Returns: { deletedCount: 50 }
```

---

## 🎯 userService.js

### 1️⃣ Register User
```javascript
const user = await userService.registerUser({
  name: "Ahmed",
  email: "ahmed@example.com",
  password: "secure123"
});

// Returns:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  token: "eyJhbGc..." // JWT Token
}
```

**أخطاء محتملة:**
- "المستخدم موجود مسبقاً"
- "بيانات غير صالحة"

---

### 2️⃣ Login User
```javascript
const user = await userService.loginUser(
  "ahmed@example.com",
  "secure123"
);

// Returns:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  token: "eyJhbGc..."
}
```

**أخطاء محتملة:**
- "البريد الإلكتروني أو كلمة المرور غير صحيحة"

⚠️ **ملاحظة أمان:** نفس الرسالة لكلا الحالات (بريد غلط أو كلمة مرور غلط) لمنع User Enumeration Attack

---

### 3️⃣ Get User Profile
```javascript
const user = await userService.getUserProfile(userId);

// Returns:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  role: "user"
}
```

---

### 4️⃣ Update User Profile
```javascript
const user = await userService.updateUserProfile(userId, {
  name: "Ahmed Updated",
  email: "newemail@example.com",
  password: "newpassword123"
});

// Returns: نفس البيانات الأعلى + token جديد
```

---

### 5️⃣ Get All Users (Admin)
```javascript
const users = await userService.getAllUsers();
// Returns: [{ _id, name, email, role }] بدون passwords
```

---

### 6️⃣ Delete User (Admin)
```javascript
const result = await userService.deleteUserById(userId);
// Returns: { message: 'User removed successfully' }
```

---

## 🎯 refundServiceFull.js

### 1️⃣ Validate Refund Request
```javascript
// يتم استدعاؤها داخل initiateRefund في Controller
await refundService.validateRefundRequest(
  orderId,
  amount,
  userId,
  userRole
);
```

**الفحوصات:**
- ✅ المبلغ موجب
- ✅ الأوردر موجود
- ✅ التصريح (صاحب أم Admin)
- ✅ الأوردر مدفوع
- ✅ المبلغ ما يتجاوز إجمالي الأوردر
- ✅ ما يوجد refund موجود للأوردر

---

### 2️⃣ Create Refund
```javascript
const refund = await refundService.createRefund({
  orderId: "6505abc123",
  userId: "6505def456",
  amount: 999
});

// Returns:
{
  _id: "6505ghi789",
  order: "6505abc123",
  user: "6505def456",
  amount: 999,
  status: "pending",
  retryCount: 0,
  createdAt: "2024-01-15..."
}
```

**ماذا يحدث:**
- ✅ ينشئ refund في DB
- ✅ يستدعي processRefund() في الخلفية

---

### 3️⃣ Process Refund (في الخلفية - Async)
```javascript
// تُستدعى تلقائياً بعد create
const success = Math.random() > 0.3; // 70% نجاح

if (success) {
  refund.status = 'success';
  refund.processedAt = new Date();
} else {
  // إعادة محاولة بعد 5 ثوان
  // حد أقصى 3 محاولات
}
```

**الحالات:**
- ✅ **success** - تم الاسترجاع
- ⏳ **pending** - قيد المعالجة
- ❌ **failed** - فشل الاسترجاع بعد 3 محاولات

---

### 4️⃣ Get Refund by Order ID
```javascript
const refund = await refundService.getRefundByOrderId(orderId, req.user);
// فحص تلقائي: هل المستخدم مصرح؟
```

---

### 5️⃣ Get All Refunds (Admin)
```javascript
const refunds = await refundService.getAllRefunds();

// Returns:
[
  {
    _id: "...",
    order: { _id, totalPrice, ... },
    user: { name, email },
    amount: 999,
    status: "success",
    ...
  }
]
```

---

### 6️⃣ Get Refund Statistics (Admin)
```javascript
const stats = await refundService.getRefundStats();

// Returns:
{
  totalRefundRequests: 150,
  successfulRefunds: 105,
  failedRefunds: 15,
  pendingRefunds: 30,
  totalRefundedAmount: 105000
}
```

---

## 🔄 مثال عملي متكامل: عملية الشراء

### الخطوة 1: إنشاء أوردر
```javascript
// POST /api/orders
{
  orderItems: [
    { product: "prod1", quantity: 1 }
  ],
  shippingAddress: "123 Main St"
}

// Controller استدعاء Service
const order = await orderService.createOrder(userId, req.body);
res.status(201).json(order);

// Returns: Order with status "pending"
```

### الخطوة 2: دفع الأوردر
```javascript
// PUT /api/orders/:id/pay
const order = await orderService.updateOrderToPaid(orderId, req.user);

// يحدث:
// ✅ فحص الأوردر مدفوع؟ لا
// ✅ فحص المخزون كافي؟ نعم
// ✅ خصم من المخزون بشكل Atomic
// ✅ تحديث الأوردر isPaid = true
// ✅ تحديث status = "paid"
```

### الخطوة 3: توصيل الأوردر (Admin)
```javascript
// PUT /api/orders/:id/deliver (Admin only)
const order = await orderService.updateOrderToDelivered(orderId, user);

// يحدث:
// ✅ فحص Admin
// ✅ فحص مدفوع؟ نعم
// ✅ تحديث isDelivered = true
// ✅ تحديث status = "delivered"
```

### الخطوة 4: استرجاع (إذا كان في الـ 15 دقيقة)
```javascript
// PUT /api/orders/:id/cancel
const order = await orderService.cancelOrder(orderId, req.user);

// يحدث:
// ✅ فحص الوقت < 15 دقيقة
// ✅ استرجاع المخزون
// ✅ حذف الأوردر (soft delete)
// ✅ إنشاء Refund تلقائي
```

### الخطوة 5: تتبع الاسترجاع
```javascript
// GET /api/refunds/orders/:id
const refund = await refundService.getRefundByOrderId(orderId, req.user);

// Returns:
{
  _id: "...",
  amount: 99.99,
  status: "pending" → "success" → "success"
  processedAt: new Date(),
  retryCount: 0
}
```

---

## ⚠️ حالات الخطأ الشائعة

### Unauthorized
```javascript
// اذا حاول مستخدم نقل أوردر شخص ثاني
if (order.user.toString() !== user._id.toString() && 
    user.role !== 'admin') {
  throw new Error('Not authorized');
}

// Controller يرسل 403
res.status(403).json({ message: 'Not authorized' });
```

### Bad Request
```javascript
// اذا حاول دفع أوردر مدفوع مسبقاً
if (order.isPaid) {
  throw new Error('Order already paid');
}

// Controller يرسل 400
res.status(400).json({ message: 'Order already paid' });
```

### Not Found
```javascript
// اذا حاول جلب أوردر غير موجود
// Service ترمي:
throw new Error('Order not found');

// Controller يرسل 404
res.status(404).json({ message: 'Order not found' });
```

---

## 🎓 الخلاصة

✅ **Service = Logic**  
✅ **Controller = Communication**  
✅ **Error في Service = يُرمى**  
✅ **Error في Controller = يُتعامل معه**  
✅ **Validation = Service**  
✅ **HTTP Status = Controller**  

---

**تم بواسطة:** GitHub Copilot
