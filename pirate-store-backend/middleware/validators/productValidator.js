const mongoose = require('mongoose');
const AppError = require('../../utils/AppError');
const Product = require('../../models/Product');

const validateProductCreation = async (req, res, next) => {
  const { name, price, description, category, countInStock, image } = req.body;

  if (name === undefined || price === undefined || description === undefined || category === undefined || countInStock === undefined || image === undefined) {
    return next(new AppError('All fields are required for product creation', 400));
  }

  if (name.length < 3) {
    return next(new AppError('Product name must be at least 3 characters long', 400));
  }
  if (price <= 0 || countInStock <= 0) {
    return next(new AppError('Product price and stock count must be greater than 0', 400));
  }

  const existingProduct = await Product.findOne({ name: name.trim() });
  if (existingProduct) {
    return next(new AppError('Product with this name already exists', 400));
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { name, price, description, category, countInStock, image } = req.body;

  if (name === undefined && price === undefined && description === undefined && category === undefined && countInStock === undefined && image === undefined) {
    return next(new AppError('At least one field is required for product update', 400));
  }

  if (name && name.length < 3) {
    return next(new AppError('Product name must be at least 3 characters long', 400));
  }

  if (price !== undefined && price <= 0) {
    return next(new AppError('Product price must be greater than 0', 400));
  }

  if (countInStock !== undefined && countInStock <= 0) {
    return next(new AppError('Stock count must be greater than 0', 400));
  }

  next();
};

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  next();
};
module.exports = {
  validateProductCreation,
  validateProductUpdate,
  validateObjectId
};