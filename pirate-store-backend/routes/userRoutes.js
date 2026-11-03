const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');

const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  deleteUserById 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// تسجيل مستخدم جديد - مفتوح للجميع
router.post(
  '/register',
  asyncWrapper(registerUser)
);

// تسجيل الدخول - مفتوح للجميع
router.post(
  '/login',
  asyncWrapper(loginUser)
);

// الحصول على بيانات المستخدم نفسه / تعديلها - يجب تسجيل الدخول
router.route('/profile')
  .get(
    asyncWrapper(protect),
    asyncWrapper(getUserProfile)
  )
  .put(
    asyncWrapper(protect),
    asyncWrapper(updateUserProfile)
  );

// ملاحظة: حذف الحساب الشخصي عبر '/profile' غير معرف في controllers، لذلك لم يُضمّن هنا.

// جلب كل المستخدمين - فقط الأدمن
router.get(
  '/',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(getAllUsers)
);

// حذف مستخدم معين - فقط الأدمن
router.delete(
  '/:id',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(deleteUserById)
);

module.exports = router;