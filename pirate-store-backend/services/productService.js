// services/productService.js
const Product = require('../models/Product');

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

/**
 * Get all products
 */
const getAllProducts = async () => {
  return await Product.find();
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  return product;
};

/**
 * Update product by ID
 */
const updateProductById = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }
  );
  
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  
  return product;
};

/**
 * Update all products
 */
const updateAllProducts = async (updateData) => {
  const result = await Product.updateMany({}, updateData);
  return result;
};

/**
 * Delete product by ID
 */
const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  
  if (!product) {
    throw new Error('المنتج غير موجود');
  }
  
  return product;
};

/**
 * Delete all products
 */
const deleteAllProducts = async () => {
  const result = await Product.deleteMany({});
  return result;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  updateAllProducts,
  deleteProductById,
  deleteAllProducts
};
