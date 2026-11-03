const mongoose = require('mongoose');
const AppError = require('../../utils/AppError');

const validateOrderCreation = (req, res, next) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return next(new AppError('Order items are required', 400));
  }

  for (const item of orderItems) {
    if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
      return next(new AppError('Each order item must include a valid product id', 400));
    }

    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return next(new AppError('Each order item must have a positive quantity', 400));
    }
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
    return next(new AppError('Shipping address with address and city is required', 400));
  }

  next();
};

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid order ID', 400));
  }

  next();
};

module.exports = {
  validateOrderCreation,
  validateObjectId
};
