// controllers/productController.js
const productService = require('../services/productService');

/**
 * Create Product - POST /api/products
 * @access Private (Admin)
 */
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get All Products - GET /api/products
 * @access Private
 */
const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء جلب المنتجات',
      error: error.message
    });
  }
};

/**
 * Get Product by ID - GET /api/products/:id
 * @access Private
 */
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error('Get Product By ID Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Product by ID - PUT /api/products/:id
 * @access Private (Admin)
 */
const updateProductById = async (req, res) => {
  try {
    const product = await productService.updateProductById(
      req.params.id,
      req.body
    );
    res.status(200).json(product);
  } catch (error) {
    console.error('Update Product Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update All Products - PUT /api/products
 * @access Private (Admin)
 */
const updateAllProducts = async (req, res) => {
  try {
    const result = await productService.updateAllProducts(req.body);
    res.status(200).json({
      message: `تم تحديث ${result.modifiedCount} منتجات.`
    });
  } catch (error) {
    console.error('Update All Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء تحديث كل المنتجات',
      error: error.message
    });
  }
};

/**
 * Delete Product by ID - DELETE /api/products/:id
 * @access Private (Admin)
 */
const deleteProductById = async (req, res) => {
  try {
    const product = await productService.deleteProductById(req.params.id);
    res.status(200).json({
      message: 'تم حذف المنتج بنجاح',
      deletedProduct: product
    });
  } catch (error) {
    console.error('Delete Product Error:', error);

    if (error.message === 'المنتج غير موجود') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete All Products - DELETE /api/products
 * @access Private (Admin)
 */
const deleteAllProducts = async (req, res) => {
  try {
    const result = await productService.deleteAllProducts();
    res.status(200).json({
      message: `تم حذف ${result.deletedCount} منتجات.`
    });
  } catch (error) {
    console.error('Delete All Products Error:', error);
    res.status(500).json({
      message: 'حدث خطأ أثناء حذف كل المنتجات',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
};