const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const pagination = require('../utils/pagination');
const filtering = require('../utils/filtering');
const sorting = require('../utils/sorting');
const searching = require('../utils/searching');
const fieldSelection = require('../utils/fieldSelection');
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
const getAllProducts = async (query) => {

  const { page, limit, skip } = pagination(query);
  const queryObj = filtering(query);
  const searchobj = searching(query);
  const sortBy= sorting(query);
  const finalQuery = { ...queryObj, ...searchobj };
  const select = fieldSelection(query);
  console.log(select);
  const totalResults = await Product.countDocuments(finalQuery);
  const products = await Product.find(finalQuery)
    .sort(sortBy)
    .select(select)
    .skip(skip)
    .limit(limit);


  const totalPages = Math.ceil(totalResults / limit);

  return {
    page,
    limit,
    totalResults,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    products
  };
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
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
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Update all products
 */
const updateAllProducts = async (updateData) => {
  return await Product.updateMany({}, updateData);
};

/**
 * Delete product by ID
 */
const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Delete all products
 */
const deleteAllProducts = async () => {
  return await Product.deleteMany({});
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