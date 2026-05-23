# 🔧 Troubleshooting Guide - دليل استكشاف الأخطاء

## ⚠️ المشاكل الشائعة والحلول

---

## 1️⃣ Database Connection Issues

### المشكلة: `MongoError: connect ECONNREFUSED 127.0.0.1:27017`

**السبب:** MongoDB غير مشغل أو الاتصال غير صحيح

**الحل:**

```bash
# تحقق من MongoDB
mongosh

# أو شغّل MongoDB اذا كان مثبتاً
# Windows:
mongod

# macOS:
brew services start mongodb-community

# Linux:
sudo service mongod start
```

---

### المشكلة: `MongoError: authentication failed`

**السبب:** بيانات الاعتماد غير صحيحة

**الحل:**

1. تحقق من `.env`:
```bash
MONGODB_URI=mongodb://username:password@localhost:27017/pirate-store
```

2. تأكد من أن المستخدم موجود في MongoDB:
```javascript
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: ["readWrite"]
})
```

---

## 2️⃣ Test Execution Errors

### المشكلة: `Cannot find module 'jest'`

**السبب:** jest غير مثبت

**الحل:**

```bash
npm install --save-dev jest supertest
```

---

### المشكلة: `TIMEOUT - Async callback was not invoked`

**السبب:** الاختبار استغرق وقتاً طويلاً

**الحل:**

```javascript
// في ملف الاختبار، زيادة الـ timeout
jest.setTimeout(10000); // 10 ثوانٍ
```

---

### المشكلة: `TypeError: Cannot read property 'findById' of undefined`

**السبب:** Model غير محمّل بشكل صحيح

**الحل:**

```javascript
// تحقق من أن Model موجود في:
const Refund = require('../models/Refund');
console.log(Refund); // يجب ألا يكون undefined
```

---

## 3️⃣ Refund Service Issues

### المشكلة: Refund stuck في `pending`

**السبب:** processRefund لم يبدأ

**الحل:**

```bash
# 1. افحص console logs
npm run dev

# 2. تحقق من قاعدة البيانات
db.refunds.find({ status: 'pending' })

# 3. جرب تشغيل المعالجة يدويًا
# في MongoDB shell:
db.refunds.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: 'success' } }
)
```

---

### المشكلة: Refund فشل مباشرة

**السبب:** processRefund فشلت في المحاولة الأولى وتنتظر الإعادة

**الحل:**

```bash
# افحص failureReason
db.refunds.findOne({ status: 'failed' }).failureReason

# إذا كان السبب متعلق بالـ Order:
# افحص Order موجود وصحيح
db.orders.find()
```

---

### المشكلة: `duplicate refund for order`

**السبب:** محاولة إنشاء refund جديد لطلب به refund

**الحل:**

```bash
# اختر إما:
# 1. حذف الـ refund القديم (development فقط)
db.refunds.deleteOne({ order: ObjectId("...") })

# 2. أو استخدم الـ refund الموجود
GET /api/refunds/orders/:orderId
```

---

## 4️⃣ Authorization Errors

### المشكلة: `401 Unauthorized`

**السبب:** Token غير موجود أو منتهي

**الحل:**

```bash
# احصل على token جديد
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# استخدم Token في الـ header
curl -X GET http://localhost:5000/api/refunds/orders/orderId \
  -H "Authorization: Bearer NEW_TOKEN"
```

---

### المشكلة: `403 Forbidden`

**السبب:** المستخدم ليس مصرح (ليس صاحب الطلب ولا أدمن)

**الحل:**

```bash
# تحقق من:
# 1. أن الـ user_id يطابق صاحب الطلب
# 2. أو أن المستخدم أدمن

# في MongoDB:
db.users.findOne({ _id: ObjectId("...") })
# يجب أن يكون role: "admin" أو نفس الـ user في الـ order
```

---

## 5️⃣ API Response Errors

### المشكلة: `500 Internal Server Error`

**الحل:**

1. افحص console logs:
```bash
npm run dev
# ستشاهد رسالة الخطأ الفعلية
```

2. جرب في Postman مع curl للحصول على تفاصيل أكثر:
```bash
curl -v -X POST http://localhost:5000/api/refunds/orders/orderId \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

---

### المشكلة: `400 Bad Request`

**الحل:**

تحقق من الـ request body:

```javascript
// صحيح:
{ "amount": 100 }

// غير صحيح:
{ "amount": "100" }          // يجب أن يكون رقم
{ "amount": 0 }              // يجب أن يكون أكبر من 0
{ "amount": 999999 }         // قد يزيد عن سعر الطلب
{}                           // مفقود amount
```

---

## 6️⃣ Node.js / NPM Issues

### المشكلة: `npm command not found`

**السبب:** Node.js غير مثبت

**الحل:**

1. تحميل Node.js من https://nodejs.org/
2. التحقق من التثبيت:
```bash
node -v
npm -v
```

---

### المشكلة: `npm ERR! code EACCES`

**السبب:** مشكلة صلاحيات

**الحل (Windows):**
```bash
# شغّل PowerShell كـ Administrator
```

**الحل (macOS/Linux):**
```bash
# استخدم sudo فقط إذا لزم الأمر
sudo npm install -g npm@latest
```

---

### المشكلة: `npm ERR! ERESOLVE unable to resolve dependency tree`

**السبب:** تضارب في إصدارات المكتبات

**الحل:**

```bash
# حذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# إعادة تثبيت
npm install
```

---

## 7️⃣ Port Issues

### المشكلة: `Error: listen EADDRINUSE :::5000`

**السبب:** Port 5000 مستخدم بالفعل

**الحل:**

```bash
# قتل البروسيس على Port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID 1234 /F

# macOS/Linux:
lsof -i :5000
kill -9 PID
```

---

## 8️⃣ Testing Issues

### المشكلة: Tests تعطل عشوائياً

**السبب:** Race conditions أو side effects

**الحل:**

```javascript
// تأكد من cleanup:
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
});
```

---

### المشكلة: Mocks غير تعمل

**الحل:**

```javascript
// استخدم jest.mock() في بداية الملف
jest.mock('../models/Refund');

// أو ابدأها قبل الاختبار
beforeAll(() => {
  jest.mock('../models/Refund');
});
```

---

## 🆘 Debugging Tools

### استخدام console.log الذكي

```javascript
// بدلاً من:
console.log(refund);

// استخدم:
console.log('🔍 Refund:', JSON.stringify(refund, null, 2));
console.log('📊 Status:', refund.status);
console.log('⏰ Created:', refund.createdAt);
```

---

### استخدام debugger

```javascript
// أضف في الكود:
debugger;

// ثم شغّل مع inspect:
node --inspect scripts/test-refund.js

// افتح: chrome://inspect/#devices
```

---

### استخدام MongoDB Compass

1. تحميل من: https://www.mongodb.com/products/compass
2. الاتصال: `mongodb://localhost:27017`
3. عرض البيانات بصريًا
4. تعديل البيانات مباشرة

---

## 📋 Debugging Checklist

- [ ] تم افحص MongoDB connection
- [ ] تم افحص console logs
- [ ] تم افحص Network requests (Postman/Browser DevTools)
- [ ] تم افحص Database records
- [ ] تم قراءة Error messages بعناية
- [ ] تم تجربة restarting server
- [ ] تم تجربة clearing cache و reinstalling

---

## 🎯 Quick Debug Steps

```bash
# 1. تشغيل الخادم مع logging
DEBUG=* npm run dev

# 2. افحص المنافذ
netstat -tlnp | grep 5000

# 3. اختبر Database
mongosh < test-mongo.js

# 4. إعادة تشغيل كاملة
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📞 الحصول على مساعدة إضافية

1. **افحص الـ logs** - console و files
2. **شغّل بـ debug mode** - `DEBUG=*`
3. **جرب test case أبسط** - ابدأ بـ happy path
4. **ابحث عن الخطأ** - في Google أو Stack Overflow
5. **اسأل في المجتمع** - Discord, Reddit, إلخ

---

**آخر تحديث:** 2024-01-20  
**الإصدار:** 1.0.0
