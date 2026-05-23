# 🧪 REFUND TESTING DOCUMENTATION

## نظرة عامة على خدمة الاسترجاع

خدمة الاسترجاع (`refundService`) تسمح للمستخدمين باسترجاع أموالهم من الطلبات المدفوعة. الخدمة توفر:

- ✅ إنشاء طلب استرجاع
- ✅ معالجة متعددة المحاولات (retry mechanism)
- ✅ تحديث حالة الطلب تلقائياً
- ✅ إحصائيات شاملة للاسترجاعات

---

## الملفات المضافة

```
pirate-store-backend/
├── controllers/
│   └── refundController.js          # ✨ جديد - معالجات API
├── routes/
│   └── refundRoutes.js              # ✨ جديد - المسارات
├── scripts/
│   └── test-refund.js               # ✨ جديد - سكريبت الاختبار
├── __tests__/
│   ├── refundService.test.js        # ✨ جديد - اختبarات الخدمة
│   └── refundAPI.integration.test.js # ✨ جديد - اختبارات التكامل
└── REFUND_TESTING_DOCUMENTATION.md   # ✨ جديد - هذا الملف
```

---

## طرق الاختبار

### 1. اختبارات الوحدة (Unit Tests)

```bash
npm test -- __tests__/refundService.test.js
```

**الاختبارات:**
- ✅ إنشاء refund بحالة pending
- ✅ استدعاء processRefund تلقائياً
- ✅ معالجة الأخطاء عند الإنشاء

---

### 2. اختبارات التكامل (Integration Tests)

```bash
npm test -- __tests__/refundAPI.integration.test.js
```

**الاختبارات:**
- ✅ POST /api/refund - إنشاء refund
- ✅ GET /api/refund/:orderId - استرجاع refund
- ✅ معالجة الحالات الخاصة (طلب غير موجود، حقول ناقصة، إلخ)

---

### 3. اختبارات سريعة (Quick Testing)

```bash
npm run test:refund
```

**الميزات:**
- اتصال حقيقي بقاعدة البيانات
- اختبار كامل دورة الاسترجاع
- إحصائيات فورية

**النتيجة المتوقعة:**
```
✅ متصل بقاعدة البيانات

📝 إنشاء بيانات اختبار...

✅ تم إنشاء مستخدم: 123456...
✅ تم إنشاء طلب: 654321...

🧪 Test 1: إنشاء Refund
─────────────────────────────────────────────
✅ تم إنشاء refund برقم: abc123...
   المبلغ: $125
   الحالة: pending
   عدد المحاولات: 0

... المزيد من النتائج ...

✨ تم اجتياز جميع الاختبارات بنجاح! ✨
```

---

### 4. الاختبارات اليدوية (Manual Testing)

#### الخطوة 1: ابدأ الخادم

```bash
npm run dev
```

#### الخطوة 2: إنشاء مستخدم

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "password": "password123"
  }'
```

احفظ ال `token` من النتيجة.

#### الخطوة 3: إنشاء منتج

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-end gaming laptop",
    "price": 1500,
    "countInStock": 5,
    "image": "laptop.jpg"
  }'
```

احفظ ال `_id` من النتيجة.

#### الخطوة 4: إنشاء طلب

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderItems": [
      {
        "product": "PRODUCT_ID",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Springfield",
      "country": "USA",
      "postalCode": "12345"
    }
  }'
```

احفظ ال `_id` من النتيجة.

#### الخطوة 5: دفع الطلب

```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

#### الخطوة 6: بدء الاسترجاع

```bash
curl -X POST http://localhost:5000/api/refunds/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 1500
  }'
```

احفظ ال `_id` من النتيجة.

#### الخطوة 7: التحقق من حالة الاسترجاع

```bash
curl -X GET http://localhost:5000/api/refunds/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**استراقب الحالات:**
- ⏳ `pending` - في الانتظار (سيعاد المحاولة)
- ✅ `success` - نجح الاسترجاع
- ❌ `failed` - فشل بعد 3 محاولات

---

## API Endpoints

### المستخدم العادي

#### إنشاء طلب استرجاع
```
POST /api/refunds/orders/:orderId
Authorization: Bearer {token}

Body:
{
  "amount": 100
}

Response:
{
  "message": "Refund initiated successfully",
  "refund": {
    "_id": "refund123",
    "order": "order123",
    "user": "user123",
    "amount": 100,
    "status": "pending",
    "retryCount": 0,
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

#### استرجاع حالة الاسترجاع
```
GET /api/refunds/orders/:orderId
Authorization: Bearer {token}

Response:
{
  "_id": "refund123",
  "order": { ... },
  "user": { ... },
  "amount": 100,
  "status": "success",
  "processedAt": "2024-01-20T10:00:05Z",
  "retryCount": 0
}
```

### الأدمن فقط

#### الحصول على جميع الاسترجاعات
```
GET /api/refunds
Authorization: Bearer {admin_token}

Response:
{
  "count": 10,
  "refunds": [...]
}
```

#### الحصول على الإحصائيات
```
GET /api/refunds/stats
Authorization: Bearer {admin_token}

Response:
{
  "totalRefundRequests": 10,
  "successfulRefunds": 7,
  "failedRefunds": 2,
  "pendingRefunds": 1,
  "totalRefundedAmount": 5000
}
```

---

## سيناريوهات الاختبار

### ✅ السيناريو 1: استرجاع ناجح

**الخطوات:**
1. إنشاء طلب وقم بدفعه
2. بدء استرجاع
3. التحقق من الحالة بعد 5 ثوان

**النتيجة المتوقعة:**
- Refund status: `success`
- Order refundStatus: `success`

---

### ✅ السيناريو 2: استرجاع مع إعادة محاولة

**الخطوات:**
1. التحقق من الـ console logs
2. لاحظ المحاولات المتعددة

**النتيجة المتوقعة:**
```
Processing refund: refund123
Refund retry: refund123 (attempt 1/3)
Refund retry: refund123 (attempt 2/3)
Refund success: refund123
```

---

### ❌ السيناريو 3: استرجاع طلب غير مدفوع

```bash
curl -X POST http://localhost:5000/api/refunds/orders/UNPAID_ORDER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 100}'

# Response:
# {"message": "Order is not paid yet"}
```

---

### ❌ السيناريو 4: استرجاع مزدوج

```bash
# المحاولة الأولى
curl -X POST http://localhost:5000/api/refunds/orders/ORDER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 100}'

# المحاولة الثانية
curl -X POST http://localhost:5000/api/refunds/orders/ORDER_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 100}'

# Response:
# {"message": "Refund already exists for this order"}
```

---

## أكوام الأخطاء (Error Stack)

| الخطأ | السبب | الحل |
|------|------|------|
| Order not found | معرف الطلب غير صحيح | تحقق من ORDER_ID |
| Order is not paid yet | الطلب لم يتم دفعه | ادفع الطلب أولاً |
| Refund already exists | refund موجود بالفعل | استعلم عن الـ refund القديم |
| Not authorized | المستخدم غير المأذون | تحقق من ملكية الطلب |
| Amount exceeds total | المبلغ أكبر من سعر الطلب | اختر مبلغ أقل |

---

## مراقبة الأداء

### Logs المهمة

استراقب هذه الـ logs في terminal:

```javascript
// عند إنشاء refund
"Refund created: {REFUND_ID}"

// عند معالجة
"Processing refund: {REFUND_ID}"

// عند إعادة محاولة
"Refund retry: {REFUND_ID} (attempt {N}/3)"

// عند النجاح
"Refund success: {REFUND_ID}"

// عند الفشل
"Refund failed: {REFUND_ID}"
```

### Database Checks

تحقق من MongoDB مباشرة:

```javascript
// شاهد جميع الـ refunds
db.refunds.find()

// شاهد التوزيع حسب الحالة
db.refunds.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])

// شاهد الـ refunds الفاشلة
db.refunds.find({ status: 'failed' })
```

---

## Debugging Tips

### المشكلة: Refund stuck في pending

**السبب:** processRefund قد لم تبدأ
**الحل:**
```javascript
// ابدأ المعالجة يدويًا
const { processRefund } = require('./services/refundService');
await processRefund('refund_id');
```

### المشكلة: Database connection issues

**السبب:** MongoDB غير متصل
**الحل:**
```bash
# تحقق من الاتصال
mongosh

# أو افحص الـ logs
npm run dev
```

### المشكلة: Authorization errors

**السبب:** Token غير صحيح أو منتهي
**الحل:**
```bash
# حصل على token جديد
# و استخدمه في الـ Authorization header
curl -X POST http://localhost:5000/api/users/login \
  -d '{"email": "ahmed@example.com", "password": "password123"}'
```

---

## Checklist الاختبار الشامل

- [ ] تم تثبيت Jest و Supertest
- [ ] تم إنشاء ملفات الاختبار
- [ ] تم إنشاء refundController.js
- [ ] تم إنشاء refundRoutes.js
- [ ] تم تحديث server.js لاستخدام refundRoutes
- [ ] تم تشغيل unit tests بنجاح
- [ ] تم تشغيل integration tests بنجاح
- [ ] تم تشغيل quick test بنجاح
- [ ] تم اختبار جميع السيناريوهات اليدوية
- [ ] تم التحقق من MongoDB records
- [ ] تم فحص logs في console
- [ ] تم اختبار error scenarios

---

## الخطوات التالية

1. ✅ **تثبيت الـ package:** `npm install`
2. ✅ **تشغيل الاختبارات:** `npm test`
3. ✅ **الاختبار السريع:** `npm run test:refund`
4. ✅ **الاختبار اليدوي:** اتبع الخطوات في هذا الملف
5. ✅ **المراقبة المستمرة:** افحص logs و database

---

## المراجع

- [Refund Service](../services/refundService.js)
- [Refund Controller](../controllers/refundController.js)
- [Refund Routes](../routes/refundRoutes.js)
- [Refund Model](../models/Refund.js)
- [Testing Guide](./REFUND_TESTING_GUIDE.md)

---

**تم التحضير بتاريخ:** 2024-01-20  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للاختبار
