/**
 * 🧪 MANUAL TESTING GUIDE FOR REFUND SERVICE
 * ============================================
 * 
 * هذا الملف يشرح كيفية اختبار خدمة الاسترجاع يدويًا باستخدام Postman أو curl
 */

// ============================================
// 1️⃣ SETUP - تحضير البيانات
// ============================================
/*
قبل الاختبار، تأكد من:
- المخادم يعمل: npm run dev
- قاعدة البيانات متصلة
- لديك حساب مستخدم (للحصول على JWT token)
*/

// ============================================
// 2️⃣ CREATE USER (إنشاء مستخدم)
// ============================================
/*
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "password123"
}

سيعطيك response مع JWT token، احفظه - ستحتاجه لكل الطلبات التالية
*/

// ============================================
// 3️⃣ CREATE PRODUCT (إنشاء منتج)
// ============================================
/*
POST http://localhost:5000/api/products
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN}

{
  "name": "Gaming Laptop",
  "description": "High-end gaming laptop",
  "price": 1500,
  "countInStock": 5,
  "image": "laptop.jpg"
}

احفظ product ID من الـ response
*/

// ============================================
// 4️⃣ CREATE ORDER (إنشاء طلب)
// ============================================
/*
POST http://localhost:5000/api/orders
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN}

{
  "orderItems": [
    {
      "product": "{PRODUCT_ID}",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "country": "USA",
    "postalCode": "12345"
  }
}

احفظ Order ID من الـ response
*/

// ============================================
// 5️⃣ UPDATE ORDER TO PAID (دفع الطلب)
// ============================================
/*
PUT http://localhost:5000/api/orders/{ORDER_ID}/pay
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN}

{}

سيؤدي إلى:
✅ تحديث حالة الطلب إلى "paid"
✅ خصم المخزون من المنتج
*/

// ============================================
// 6️⃣ INITIATE REFUND (بدء عملية استرجاع)
// ============================================
/*
POST http://localhost:5000/api/orders/{ORDER_ID}/refund
Content-Type: application/json
Authorization: Bearer {YOUR_TOKEN}

{
  "amount": 1500
}

Response:
{
  "_id": "refund123",
  "order": "{ORDER_ID}",
  "user": "{USER_ID}",
  "amount": 1500,
  "status": "pending",
  "retryCount": 0,
  "createdAt": "2024-01-20T10:00:00Z"
}

⏳ سيبدأ processRefund تلقائيًا بعد 0ms
*/

// ============================================
// 7️⃣ CHECK REFUND STATUS (التحقق من حالة الاسترجاع)
// ============================================
/*
GET http://localhost:5000/api/orders/{ORDER_ID}/refund
Authorization: Bearer {YOUR_TOKEN}

Response:
{
  "_id": "refund123",
  "order": "{ORDER_ID}",
  "user": "{USER_ID}",
  "amount": 1500,
  "status": "success" أو "pending" أو "failed",
  "processedAt": "2024-01-20T10:00:05Z",
  "retryCount": 0,
  "failureReason": null
}

الحالات الممكنة:
- pending: في الانتظار (سيعاد المحاولة بعد 5 ثوان)
- success: نجح الاسترجاع
- failed: فشل بعد 3 محاولات
*/

// ============================================
// 8️⃣ MONITOR RETRIES (مراقبة المحاولات)
// ============================================
/*
بما أن processRefund محاكاة (70% نجاح - 30% فشل)
جرب التحقق من الحالة عدة مرات:

المحاولة 1: GET /api/orders/{ORDER_ID}/refund
  → status: pending (إذا فشلت)
  
بعد 5 ثوان:
المحاولة 2: GET /api/orders/{ORDER_ID}/refund
  → status: pending (محاولة ثانية)
  
بعد 5 ثوان:
المحاولة 3: GET /api/orders/{ORDER_ID}/refund
  → status: pending (محاولة ثالثة)
  
بعد 5 ثوان:
المحاولة 4: GET /api/orders/{ORDER_ID}/refund
  → status: failed (تم استنزاف كل المحاولات)
*/

// ============================================
// 9️⃣ CHECK ORDER STATUS UPDATE (التحقق من تحديث الطلب)
// ============================================
/*
GET http://localhost:5000/api/orders/{ORDER_ID}
Authorization: Bearer {YOUR_TOKEN}

Response:
{
  "_id": "{ORDER_ID}",
  ...
  "refund": "{REFUND_ID}",
  "refundStatus": "success" أو "failed",
  "status": "paid" أو "refunded"
}

بعد نجاح الاسترجاع:
- refundStatus: "success"
- order.refund: ID من refund
*/

// ============================================
// 🔟 EDGE CASES & ERROR SCENARIOS
// ============================================
/*

### Scenario 1: محاولة استرجاع طلب غير مدفوع
POST /api/orders/{UNPAID_ORDER_ID}/refund
→ 400 Bad Request: "Order is not paid yet"

### Scenario 2: طلب غير موجود
POST /api/orders/invalidID/refund
→ 404 Not Found: "Order not found"

### Scenario 3: استرجاع مزدوج
1. POST /api/orders/{ORDER_ID}/refund → success
2. POST /api/orders/{ORDER_ID}/refund → 400 Bad Request: "Refund already exists"

### Scenario 4: مستخدم آخر يحاول استرجاع طلب غيره
POST /api/orders/{OTHER_USER_ORDER_ID}/refund
→ 403 Forbidden: "Not authorized"
*/

// ============================================
// 1️⃣1️⃣ CURL EXAMPLES
// ============================================

/*
# 1. تسجيل مستخدم
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "password": "password123"
  }'

# 2. إنشاء طلب
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "orderItems": [{"product": "{PRODUCT_ID}", "quantity": 1}],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Springfield",
      "country": "USA",
      "postalCode": "12345"
    }
  }'

# 3. دفع الطلب
curl -X PUT http://localhost:5000/api/orders/{ORDER_ID}/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{}'

# 4. بدء استرجاع
curl -X POST http://localhost:5000/api/orders/{ORDER_ID}/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{"amount": 1500}'

# 5. التحقق من حالة الاسترجاع
curl -X GET http://localhost:5000/api/orders/{ORDER_ID}/refund \
  -H "Authorization: Bearer {TOKEN}"
*/

// ============================================
// 1️⃣2️⃣ TESTING CHECKLIST
// ============================================

/*
✅ Unit Tests باستخدام Jest:
  - npm test -- __tests__/refundService.test.js
  
✅ Integration Tests:
  - npm test -- __tests__/refundAPI.integration.test.js

✅ Manual Testing:
  - استخدم Postman أو curl
  - اتبع الخطوات من 1 إلى 9 أعلاه
  
✅ Load Testing (اختياري):
  - استخدم Apache JMeter أو Artillery
  - اختبر مع 100+ طلب استرجاع متزامن

✅ Database Testing:
  - تأكد أن البيانات محفوظة بشكل صحيح
  - تحقق من Order و Refund collections في MongoDB
  
✅ Edge Cases:
  - استرجاع مزدوج
  - طلب غير موجود
  - طلب غير مدفوع
  - مستخدم غير مخول
*/

// ============================================
// 1️⃣3️⃣ LOGS TO MONITOR
// ============================================

/*
استراقب هذه الـ logs في console:

1. عند إنشاء refund:
   "Refund created: {REFUND_ID}"

2. عند بدء processRefund:
   "Processing refund: {REFUND_ID}"

3. عند المحاولات المتعددة:
   "Refund retry: {REFUND_ID} (attempt {N}/3)"

4. عند النجاح:
   "Refund success: {REFUND_ID}"

5. عند الفشل:
   "Refund failed: {REFUND_ID} - {ERROR_MESSAGE}"

إذا لم تر هذه الـ logs، أضفهم إلى refundService.js:
console.log('Processing refund:', refundId);
console.log('Refund status:', refund.status);
*/
