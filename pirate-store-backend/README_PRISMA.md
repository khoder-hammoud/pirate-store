# 📚 دليل الترحيل من Mongoose إلى Prisma

## 🎯 ما تم إنجازه

تم إنشاء **نسخ مقررة من جميع الخدمات والـ Middleware** مع استخدام Prisma بدل Mongoose، مع **الحفاظ على النسخ القديمة** حتى تستطيع المقارنة والفهم بشكل أفضل.

---

## 📋 الملفات المُنشأة

### ✅ ملفات Prisma الجديدة:
```
✓ config/db.prisma.js                    - الاتصال بـ Prisma
✓ middleware/authMiddleware.prisma.js    - التحقق من الهوية
✓ services/userService.prisma.js         - إدارة المستخدمين
✓ services/productService.prisma.js      - إدارة المنتجات
✓ services/orderService.prisma.js        - إدارة الطلبات
✓ services/refundService.prisma.js       - إدارة المبالغ المسترجعة
```

### 📚 أدلة المقارنة:
```
📖 MIGRATION_GUIDE.md      - شرح مفصل للفروقات والمفاهيم
📖 COMPARISON_GUIDE.md     - دليل سريع مع أرقام الأسطر
```

### ❌ الملفات القديمة (محفوظة):
```
config/db.js
middleware/authMiddleware.js
services/userService.js
services/productService.js
services/orderService.js
services/refundServiceFull.js
models/ (جميع الملفات)
```

---

## 🚀 الخطوات التالية للتفعيل

### الخطوة 1️⃣: تحديث server.js
```javascript
// ❌ القديم
const connectDB = require('./config/db');
connectDB();

// ✅ الجديد
const { connectDB, prisma } = require('./config/db.prisma');
connectDB();
```

### الخطوة 2️⃣: تحديث Controllers
```javascript
// ❌ القديم
const userService = require('../services/userService');

// ✅ الجديد
const userService = require('../services/userService.prisma');
```

**تحتاج تعديل جميع Controllers:**
- `controllers/userController.js`
- `controllers/productController.js`
- `controllers/orderController.js`
- `controllers/refundController.js`

### الخطوة 3️⃣: تحديث Middleware
```javascript
// ❌ القديم
const { protect, admin } = require('../middleware/authMiddleware');

// ✅ الجديد
const { protect, admin } = require('../middleware/authMiddleware.prisma');
```

### الخطوة 4️⃣: اختبار الـ API
استخدم Postman لاختبار جميع الـ endpoints:
```
POST /api/users/register
POST /api/users/login
GET /api/products
POST /api/orders
```

### الخطوة 5️⃣: التنظيف (بعد التأكد من النجاح)
```bash
# بعد التأكد من أن كل شيء يعمل بشكل صحيح، احذف الملفات القديمة:
rm config/db.js
rm middleware/authMiddleware.js
rm services/userService.js
rm services/productService.js
rm services/orderService.js
rm services/refundServiceFull.js
rm -rf models/

# ثم أعد تسمية الملفات الجديدة بحذف ".prisma"
mv config/db.prisma.js config/db.js
mv middleware/authMiddleware.prisma.js middleware/authMiddleware.js
# ... إلخ
```

---

## 🔍 نقاط مهمة للانتباه

### 1️⃣ معرفات المستخدمين
- **Mongoose**: استخدم `_id` (مثل: `order.user._id`)
- **Prisma**: استخدم `id` (مثل: `order.userId`)

```javascript
// ❌ القديم
if (order.user.toString() !== user._id.toString())

// ✅ الجديد
if (order.userId !== user.id)
```

### 2️⃣ Select Syntax
```javascript
// ❌ القديم - استثناء
.select('-password')

// ✅ الجديد - تحديد
select: { password: false }
// أو بشكل صريح:
select: { id: true, name: true, email: true }
```

### 3️⃣ الـ Relationships
```javascript
// ❌ القديم
.populate('user').populate('order')

// ✅ الجديد
include: { user: true, order: true }
```

### 4️⃣ Transactions
```javascript
// ❌ القديم - معقد
session.startTransaction()
// مع كل عملية .session(session)
session.commitTransaction()

// ✅ الجديد - بسيط
prisma.$transaction(async (tx) => {
  // جميع العمليات هنا
})
```

---

## ⚙️ تكوين Prisma

### ✅ يجب أن يكون لديك:
1. **DATABASE_URL** في `.env`
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/pirate_store
   ```

2. **schema.prisma** محدث (موجود بالفعل)
   ```
   prisma/schema.prisma
   ```

3. **Prisma Client** مثبت
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

4. **إجراء Migration**
   ```bash
   npx prisma migrate deploy
   ```

---

## 📊 جدول المقارنة السريع

| المميزة | Mongoose | Prisma |
|--------|----------|--------|
| البحث عن واحد | `findById()` | `findUnique()` |
| البحث عن متعدد | `find()` | `findMany()` |
| الإنشاء | `create()` / `save()` | `create()` |
| التحديث | `findByIdAndUpdate()` | `update()` |
| الحذف | `findByIdAndDelete()` | `delete()` |
| **Transactions** | معقد (session) | **بسيط ($transaction)** ✨ |
| **Type Safety** | ضعيف | **قوي جداً** ✨ |
| **الأداء** | جيد | **أفضل** ✨ |

---

## 🛠️ أدوات للمقارنة

### عرض الملفات جنباً إلى جنب
**في VS Code:**
```
1. افتح الملف القديم (يساراً)
2. اضغط Ctrl + K ثم V (يميناً)
3. افتح الملف الجديد
```

**أو استخدم Split View:**
```
File > Split Editor
```

### المحررات الموصى بها
- **VS Code** مع extension `Prisma` الرسمي
- متصفح لـ Prisma Studio:
  ```bash
  npx prisma studio
  ```

---

## 📚 الأدلة الموجودة

| الملف | الغرض |
|------|--------|
| `MIGRATION_GUIDE.md` | شرح مفصل بأمثلة عملية |
| `COMPARISON_GUIDE.md` | دليل سريع مع أرقام أسطر |
| `prisma/schema.prisma` | تعريف قاعدة البيانات |

---

## ✅ قائمة التحقق

- [ ] فهمت الفروقات بين Mongoose و Prisma
- [ ] قرأت `MIGRATION_GUIDE.md` و `COMPARISON_GUIDE.md`
- [ ] أعددت الملفات الجديدة في الـ controllers
- [ ] حدثت `server.js`
- [ ] اختبرت الـ API الأساسية
- [ ] تأكدت من أن Transactions تعمل
- [ ] حذفت الملفات القديمة (إذا كنت متأكداً)
- [ ] أعدت تسمية الملفات الجديدة بحذف `.prisma`

---

## 🎓 موارد إضافية

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## ❓ أسئلة شائعة

### س: هل يمكنني استخدام النسختين معاً؟
ج: **لا.** يجب اختيار واحدة. جميع الملفات يجب أن تستخدم نفس ORM.

### س: كيف أحول البيانات الموجودة؟
ج: استخدم Prisma Migrate للانتقال من MongoDB إلى PostgreSQL (أو قاعدة البيانات الجديدة).

### س: هل يمكني استخدام Prisma مع MongoDB؟
ج: **نعم!** لكن Prisma يوصي بـ PostgreSQL لأداء أفضل.

### س: هل هناك فرق في الأداء؟
ج: **نعم، Prisma أسرع** بفضل Query Optimization والـ Type Safety.

---

## 🚀 الخطوة الأولى

1. **اقرأ المقارنات:**
   ```bash
   # افتح في المتصفح أو في VS Code
   MIGRATION_GUIDE.md
   COMPARISON_GUIDE.md
   ```

2. **جرّب الملفات الجديدة:**
   ```bash
   # استخدم .prisma files في controllers الخاصة بك
   const userService = require('../services/userService.prisma');
   ```

3. **اختبر جميع الـ Endpoints**
   ```bash
   npm test
   # أو استخدم Postman
   ```

4. **قارن النتائج** بين القديم والجديد

---

## 💡 نصيحة ذهبية

**اقرأ أولاً وافهم الفروقات قبل تطبيق التغييرات على الملفات الأخرى!**

النسخ الجديدة موجودة للدراسة والمقارنة فقط. عندما تشعر بثقة كاملة، ابدأ بتحديث الملفات الأخرى.

---

**تاريخ الإنشاء:** 2026-08-22  
**الحالة:** ✅ جاهز للفهم والدراسة  
**الخطوة التالية:** قراءة الأدلة والمقارنات
