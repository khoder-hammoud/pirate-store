const express = require('express');
const asyncWrapper = require("../utils/asyncWrapper");

const router = express.Router();

const {
  validateProductCreation,
  validateProductUpdate,
  validateObjectId
} = require('../middleware/validators/productValidator');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
} = require('../controllers/productController');

const {
  protect,
  admin
} = require('../middleware/authMiddleware');

const {
  validatePagination,
  sortvalidator,
  keywordValidator,
  fieldSelectionValidator,
} = require('../middleware/validators/paginationValidator');
// ======================
// GET ALL / CREATE / UPDATE ALL
// ======================
router.route('/')
  .get(
    asyncWrapper(protect),
    asyncWrapper(validatePagination),
    asyncWrapper(sortvalidator),
    asyncWrapper(keywordValidator),
    asyncWrapper(fieldSelectionValidator),
    asyncWrapper(getProducts)
  )

  // 🔒 create product (admin only)
  .post(
    asyncWrapper(protect),
    asyncWrapper(admin),
    asyncWrapper(validateProductCreation),
    asyncWrapper(createProduct)
  )

  // 🔒 update all products (admin only)
  .put(
    asyncWrapper(protect),
    asyncWrapper(admin),
    asyncWrapper(validateProductUpdate),
    asyncWrapper(updateAllProducts)
  );


// ======================
// GET / UPDATE / DELETE BY ID
// ======================
router.route('/:id')

  // 🔓 get single product
  .get(
    asyncWrapper(protect),
    asyncWrapper(validateObjectId),
    asyncWrapper(getProductById)
  )

  // 🔒 update product by id
  .put(
    asyncWrapper(protect),
    asyncWrapper(admin),
    asyncWrapper(validateObjectId),
    asyncWrapper(validateProductUpdate),
    asyncWrapper(updateProductById)
  )

  // 🔒 delete product by id
  .delete(
    asyncWrapper(protect),
    asyncWrapper(admin),
    asyncWrapper(validateObjectId),
    asyncWrapper(deleteProductById)
  );


// ======================
// DELETE ALL PRODUCTS
// ======================
router.delete(
  '/',
  asyncWrapper(protect),
  asyncWrapper(admin),
  asyncWrapper(deleteAllProducts)
);

module.exports = router;