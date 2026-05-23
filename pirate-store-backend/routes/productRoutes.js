const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// جميع المستخدمين المسجلين يقدروا يشوفوا المنتجات
// فقط الأدمن يقدر ينشئ منتج جديد

router.route('/')
.get(protect, getProducts)
.post(protect, admin, createProduct) 
.put( protect, admin, updateAllProducts);

// حماية المسار - أي مستخدم مسجل يقدر يشوف منتج واحد
router.route('/:id')
.get( protect, getProductById)
.put( protect, admin, updateProductById)


// حذف منتج معين - فقط الأدمن
router.delete('/:id', protect, admin, deleteProductById);

// حذف كل المنتجات - فقط الأدمن
router.delete('/', protect, admin, deleteAllProducts);

module.exports = router;