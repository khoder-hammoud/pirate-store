const express = require('express');
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
router.post('/register', registerUser);

// تسجيل الدخول - مفتوح للجميع
router.post('/login', loginUser);

// الحصول على بيانات المستخدم نفسه - يجب تسجيل الدخول
router.get('/profile', protect, getUserProfile);

// تعديل بيانات المستخدم نفسه - يجب تسجيل الدخول
router.put('/profile', protect, updateUserProfile);

// جلب كل المستخدمين - فقط الأدمن
router.get('/', protect, admin, getAllUsers);

// حذف مستخدم معين - فقط الأدمن
router.delete('/:id', protect, admin, deleteUserById);

module.exports = router;