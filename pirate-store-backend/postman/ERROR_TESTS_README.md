ملف اختبارات الأخطاء - Pirate Store
=================================

محتوى الملف:
- `Pirate Store - Error Tests.postman_collection.json` — مجموعة Postman لاختبار حالات الخطأ الشائعة.

المتطلبات قبل التشغيل:
- استورد البيئة `Pirate Store.postman_environment.json` الموجود في نفس المجلد واخترها.
- اضبط `{{baseUrl}}`، و`{{userEmail}}`/`{{userPassword}}`، و`{{adminEmail}}`/`{{adminPassword}}` حسب بيئتك.
- بعض الاختبارات تتطلّب `{{productId}}` أو `{{orderId}}` موجودة — يُفضّل تشغيل مجموعة الاختبارات الأساسية أولاً (انسخ من `Pirate Store.postman_collection.json`) لإنشاء منتجات وطلبات.

كيفية التشغيل:
1. في Postman: File > Import > استورد `Pirate Store - Error Tests.postman_collection.json`.
2. اختر البيئة `Pirate Store - Local` أو أنشئ بيئة مشابهة مع المتغيرات المذكورة.
3. نفّذ الطلبات بالترتيب لتسهيل التحضير (أو شغّلها مفردة حسب الحاجة).

ملاحظة:
- بعض الاختبارات (مثل Duplicate User) تفترض وجود مستخدم مسجّل مسبقًا؛ لذلك تضمّ المجموعة طلبًا "Ensure Test User Exists" لتسهيل الإعداد.
- النتائج تتحقق عبر تحقق بسيط على رمز الحالة (`400/401/403`) ورسائل الخطأ.
