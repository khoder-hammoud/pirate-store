# 🛣️ شرح الـ Routes والـ Endpoints

## 📋 ملخص Endpoints

### 🏪 Product Endpoints
```
GET    /api/products              - جلب جميع المنتجات (Protected)
POST   /api/products              - إنشاء منتج (Admin)
PUT    /api/products              - تحديث جميع المنتجات (Admin)
GET    /api/products/:id          - جلب منتج واحد (Protected)
PUT    /api/products/:id          - تحديث منتج (Admin)
DELETE /api/products/:id          - حذف منتج (Admin)
DELETE /api/products              - حذف جميع المنتجات (Admin)
```

### 👥 User Endpoints
```
POST   /api/users/register        - تسجيل مستخدم جديد (Public)
POST   /api/users/login           - تسجيل دخول (Public)
GET    /api/users/profile         - جلب بيانات المستخدم (Protected)
PUT    /api/users/profile         - تحديث بيانات المستخدم (Protected)
GET    /api/users                 - جلب جميع المستخدمين (Admin)
DELETE /api/users/:id             - حذف مستخدم (Admin)
```

### 📦 Order Endpoints
```
POST   /api/orders                - إنشاء أوردر (Protected)
GET    /api/orders/myorders       - جلب أوردراتي (Protected)
GET    /api/orders/:id            - جلب أوردر واحد (Protected)
DELETE /api/orders/:id            - حذف أوردر (Admin)
PUT    /api/orders/:id/pay        - دفع الأوردر (Protected)
PUT    /api/orders/:id/deliver    - توصيل الأوردر (Admin)
PUT    /api/orders/:id/cancel     - إلغاء الأوردر (Protected)
```

### 💰 Refund Endpoints
```
POST   /api/refunds/orders/:id    - طلب استرجاع (Protected)
GET    /api/refunds/orders/:id    - جلب استرجاع (Protected)
GET    /api/refunds               - جلب جميع الاسترجاعات (Admin)
GET    /api/refunds/stats         - إحصائيات الاسترجاعات (Admin)
```

---

## 📝 تفاصيل كل Route

### 1️⃣ Product Routes

#### GET `/api/products`
```javascript
// protected middleware: يفحص التوكن
// userController.getProducts من المشاهدة
router.get('/', protect, getProducts);

// الاستجابة:
[
  {
    _id: "6505abc123",
    name: "iPhone 14",
    price: 999,
    category: "electronics",
    countInStock: 50
  }
]
```

#### POST `/api/products` (Admin)
```javascript
router.post('/', protect, admin, createProduct);

// Request Body:
{
  name: "iPhone 14",
  description: "Apple iPhone",
  price: 999,
  category: "electronics",
  countInStock: 50,
  image: "https://..."
}

// Response: المنتج المنشأ
Status: 201 Created
```

#### PUT `/api/products/:id` (Admin)
```javascript
router.put('/:id', protect, admin, updateProductById);

// Request Body:
{
  price: 1099,
  countInStock: 30
}

// Response: المنتج المحدث
Status: 200 OK
```

#### DELETE `/api/products/:id` (Admin)
```javascript
router.delete('/:id', protect, admin, deleteProductById);

// Response: 
{
  message: "تم حذف المنتج بنجاح",
  deletedProduct: { _id, name, ... }
}
Status: 200 OK
```

---

### 2️⃣ User Routes

#### POST `/api/users/register` (Public)
```javascript
router.post('/register', registerUser);

// Request Body:
{
  name: "Ahmed",
  email: "ahmed@example.com",
  password: "secure123"
}

// Response:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  token: "eyJhbGciOiJIUzI1NiI..." // JWT Token
}
Status: 201 Created
```

#### POST `/api/users/login` (Public)
```javascript
router.post('/login', loginUser);

// Request Body:
{
  email: "ahmed@example.com",
  password: "secure123"
}

// Response:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  token: "eyJhbGciOiJIUzI1NiI..."
}
Status: 200 OK
```

#### GET `/api/users/profile` (Protected)
```javascript
router.get('/profile', protect, getUserProfile);

// Response:
{
  _id: "6505abc123",
  name: "Ahmed",
  email: "ahmed@example.com",
  role: "user" // أو "admin"
}
Status: 200 OK
```

#### PUT `/api/users/profile` (Protected)
```javascript
router.put('/profile', protect, updateUserProfile);

// Request Body (اختياري):
{
  name: "Ahmed Updated",
  email: "newemail@example.com",
  password: "newpassword123"
}

// Response: نفس بيانات Profile + token جديد
Status: 200 OK
```

#### GET `/api/users` (Admin)
```javascript
router.get('/', protect, admin, getAllUsers);

// Response:
[
  {
    _id: "6505abc123",
    name: "Ahmed",
    email: "ahmed@example.com",
    role: "user"
  }
  // بدون passwords
]
Status: 200 OK
```

---

### 3️⃣ Order Routes

#### POST `/api/orders` (Protected)
```javascript
router.post("/", protect, createOrder);

// Request Body:
{
  orderItems: [
    {
      product: "6505prod123",
      quantity: 2
    }
  ],
  shippingAddress: "123 Main St, Palestine"
}

// Response:
{
  _id: "6505order123",
  user: "6505user123",
  orderItems: [
    {
      product: "6505prod123",
      name: "iPhone 14",
      quantity: 2,
      price: 999
    }
  ],
  shippingAddress: "123 Main St, Palestine",
  itemsPrice: 1998,
  taxAmount: 299.7,
  shippingPrice: 10,
  totalPrice: 2307.7,
  status: "pending",
  isPaid: false,
  isDelivered: false,
  invoiceNumber: "INV-1705320000000"
}
Status: 201 Created
```

#### GET `/api/orders/myorders` (Protected)
```javascript
router.get("/myorders", protect, getUserOrders);

// Response: مصفوفة من أوردرات المستخدم
[
  { _id, status, totalPrice, createdAt, ... },
  { _id, status, totalPrice, createdAt, ... }
]
Status: 200 OK
```

#### GET `/api/orders/:id` (Protected)
```javascript
router.get("/:id", protect, getOrderById);

// فقط صاحب الأوردر أو Admin يقدر يفتحه
// Response: تفاصيل الأوردر
Status: 200 OK
```

#### DELETE `/api/orders/:id` (Admin)
```javascript
router.delete("/:id", protect, admin, deleteOrder);

// Soft Delete - بيانات متبقية في DB
Response: { message: "Order soft deleted successfully" }
Status: 200 OK
```

#### PUT `/api/orders/:id/pay` (Protected)
```javascript
router.put("/:id/pay", protect, updateOrderToPaid);

// ماذا يحدث في Service:
// 1. فحص الأوردر موجود
// 2. فحص المتخدم مصرح
// 3. فحص ما مدفوع مسبقاً
// 4. خصم المخزون (Atomic Transaction)
// 5. تحديث الأوردر isPaid = true, status = "paid"

Response:
{
  message: "Order paid and stock updated successfully",
  order: { ... updatedOrder ... }
}
Status: 200 OK
```

#### PUT `/api/orders/:id/deliver` (Admin)
```javascript
router.put("/:id/deliver", protect, admin, updateOrderToDelivered);

// فقط Admin يقدر يوصل الأوردر
Response:
{
  message: "Order marked as delivered",
  order: { ... updatedOrder, isDelivered: true ... }
}
Status: 200 OK
```

#### PUT `/api/orders/:id/cancel` (Protected)
```javascript
router.put("/:id/cancel", protect, cancelOrder);

// ماذا يحدث:
// 1. فحص الناتجة أقل من 15 دقيقة
// 2. استرجاع المخزون
// 3. حذف الأوردر (soft delete)
// 4. إنشاء Refund تلقائي إذا كان مدفوع

Response:
{
  message: "Order cancelled successfully",
  order: { ... cancelledOrder ... }
}
Status: 200 OK
```

---

### 4️⃣ Refund Routes

#### POST `/api/refunds/orders/:id` (Protected)
```javascript
router.post('/orders/:id', protect, initiateRefund);

// Request Body:
{
  amount: 99.99 // المبلغ المراد استرجاعه
}

// Service يفحص:
// 1. المبلغ موجب
// 2. الأوردر موجود
// 3. المستخدم مصرح
// 4. الأوردر مدفوع
// 5. المبلغ ما يتجاوز الإجمالي
// 6. ما يوجد refund موجود

Response:
{
  message: "Refund initiated successfully",
  refund: {
    _id: "6505ref123",
    order: "6505order123",
    user: "6505user123",
    amount: 99.99,
    status: "pending", // → سيصبح "success" في الخلفية
    retryCount: 0
  }
}
Status: 201 Created
```

#### GET `/api/refunds/orders/:id` (Protected)
```javascript
router.get('/orders/:id', protect, getRefundByOrderId);

// فقط صاحب الأوردر أو Admin
Response: تفاصيل الاسترجاع
{
  _id: "6505ref123",
  order: { _id, totalPrice, ... },
  user: { name, email },
  amount: 99.99,
  status: "success",
  processedAt: "2024-01-15..."
}
Status: 200 OK
```

#### GET `/api/refunds` (Admin)
```javascript
router.get('/', protect, admin, getAllRefunds);

// جميع المسترجعات مع تفاصيل الأوردرات والمستخدمين
Response:
{
  count: 25,
  refunds: [
    { _id, order, user, amount, status, ... },
    { _id, order, user, amount, status, ... }
  ]
}
Status: 200 OK
```

#### GET `/api/refunds/stats` (Admin)
```javascript
router.get('/stats', protect, admin, getRefundStats);

// إحصائيات المسترجعات
Response:
{
  totalRefundRequests: 150,
  successfulRefunds: 105,
  failedRefunds: 15,
  pendingRefunds: 30,
  totalRefundedAmount: 105000
}
Status: 200 OK
```

---

## 🔐 Middleware

### `protect` - فحص التوكن
```javascript
// يفحص:
// 1. وجود توكن
// 2. صحة والتوكن
// 3. إضافة req.user من البيانات المكودة في التوكن

// Headers المطلوبة:
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

### `admin` - فحص الأدمن
```javascript
// يعتمد على protect
// يفحص: user.role === "admin"

// يجب استخدامه مع protect
router.delete('/:id', protect, admin, deleteProduct);
```

---

## 📊 HTTP Status Codes المستخدمة

| Code | الحالة | الأمثلة |
|------|--------|--------|
| 201 | Created | إنشاء أوردر، تسجيل مستخدم |
| 200 | OK | جلب البيانات، تحديث |
| 400 | Bad Request | بيانات خاطئة، أوردر مدفوع مسبقاً |
| 401 | Unauthorized | بريد أو كلمة مرور خاطئة |
| 403 | Forbidden | غير سلطة (ليس Admin) |
| 404 | Not Found | أوردر ما موجود |
| 500 | Server Error | خطأ غير متوقع |

---

## ⚠️ Error Messages

### OrderController
```javascript
"Order items are required" (400)
"Shipping address is required" (400)
"Product not found: ..." (404)
"Insufficient stock for product: ..." (400)
"Order not found" (404)
"Not authorized" (403)
"Order already paid" (400)
"Invalid status transition" (400)
"Order is not paid yet" (400)
"Order already delivered" (400)
"Order already cancelled" (400)
"Cancel window expired" (400)
```

### UserController
```javascript
"المستخدم موجود مسبقاً" (400)
"بيانات غير صالحة" (400)
"البريد الإلكتروني أو كلمة المرور غير صحيحة" (401)
"User not found" (404)
```

### ProductController
```javascript
"المنتج غير موجود" (404)
```

### RefundController
```javascript
"Amount must be a positive number" (400)
"Order not found" (404)
"Not authorized to refund this order" (403)
"Order is not paid yet" (400)
"Refund amount cannot exceed order total: ..." (400)
"Refund already exists for this order" (400)
"No refund found for this order" (404)
"Not authorized" (403)
```

---

## 🧪 أمثلة على Requests باستخدام cURL

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderItems": [
      {"product": "6505abc123", "quantity": 2}
    ],
    "shippingAddress": "123 Main St"
  }'
```

### Pay Order
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Refund Stats (Admin)
```bash
curl -X GET http://localhost:5000/api/refunds/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔄 Flow Diagram

```
Client Request
     ↓
Routes (orderRoutes.js)
     ↓
Middleware (protect, admin)
     ↓
Controller (createOrder)
     ↓
Service (orderService.createOrder)
     ↓
Models (Order.create)
     ↓
Database
     ↓
Response (201 JSON)
```

---

**تم بواسطة:** GitHub Copilot
