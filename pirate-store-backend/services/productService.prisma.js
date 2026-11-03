const { prisma } = require('../config/db.prisma');
const AppError = require('../utils/AppError');
const { buildPrismaQuery, buildPaginationMeta } = require('../utils/prismaQuery');

/**
 * Create a new product
 */
const createProduct = async (productData) => {
  // ✅ PRISMA: استخدام prisma.product.create
  const product = await prisma.product.create({
    data: productData
  });
  return product;
};

/**
 * Get all products
 */
const getAllProducts = async (query = {}) => {
  const requestQuery = query || {};
  const page = Number(requestQuery.page) || 1;
  const limit = Number(requestQuery.limit) || 10;

  const queryOptions = buildPrismaQuery({
    query: requestQuery,
    page,
    limit,
    sort: requestQuery.sort,
    sortBy: requestQuery.sortBy,
    sortOrder: requestQuery.sortOrder,
    search: requestQuery.keyword || requestQuery.search,
    searchFields: ['name', 'description'],
    select: requestQuery.fields,
    filters: {
      ...(requestQuery.category ? { category: requestQuery.category } : {}),
      ...(requestQuery.minPrice !== undefined ? { price: { gte: Number(requestQuery.minPrice) } } : {}),
      ...(requestQuery.maxPrice !== undefined ? { price: { lte: Number(requestQuery.maxPrice) } } : {})
    }
  });

  const [products, totalResults] = await Promise.all([
    prisma.product.findMany(queryOptions),
    prisma.product.count({
      where: queryOptions.where
    })
  ]);

  return {
    ...buildPaginationMeta({
      total: totalResults,
      page,
      limit
    }),
    products
  };
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  // ✅ PRISMA: استخدام prisma.product.findUnique
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Update product by ID
 */
const updateProductById = async (productId, updateData) => {
  // ✅ PRISMA: استخدام prisma.product.update
  const product = await prisma.product.update({
    where: { id: productId },
    data: updateData
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Update all products
 */
const updateAllProducts = async (updateData) => {
  // ✅ PRISMA: استخدام prisma.product.updateMany
  return await prisma.product.updateMany({
    data: updateData
  });
};

/**
 * Delete product by ID
 */
const deleteProductById = async (productId) => {
  // ✅ PRISMA: استخدام prisma.product.delete
  const product = await prisma.product.delete({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

/**
 * Delete all products
 */
const deleteAllProducts = async () => {
  // ✅ PRISMA: استخدام prisma.product.deleteMany
  return await prisma.product.deleteMany({});
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
