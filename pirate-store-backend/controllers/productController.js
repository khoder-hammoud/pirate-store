const productService = require('../services/productService');
const AppError = require('../utils/AppError');

// Create Product
const createProduct = async (req, res, next) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json(product);
};

// Get All Products
const getProducts = async (req, res ,next) => {
  const products = await productService.getAllProducts(req.query);

  res.status(200).json(products);
};

// Get Product by ID
const getProductById = async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json(product);
};

// Update Product by ID
const updateProductById = async (req, res, next) => {
  const product = await productService.updateProductById(
    req.params.id,
    req.body
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json(product);
};

// Update All Products
const updateAllProducts = async (req, res) => {
  const result = await productService.updateAllProducts(req.body);

  res.status(200).json({
    message: `تم تحديث ${result.modifiedCount} منتجات.`
  });
};

// Delete Product by ID
const deleteProductById = async (req, res, next) => {
  const product = await productService.deleteProductById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    message: 'تم حذف المنتج بنجاح',
    deletedProduct: product
  });
};

// Delete All Products
const deleteAllProducts = async (req, res) => {
  const result = await productService.deleteAllProducts();

  res.status(200).json({
    message: `تم حذف ${result.deletedCount} منتجات.`
  });
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