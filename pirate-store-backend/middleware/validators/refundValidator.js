const mongoose = require('mongoose');
const AppError = require('../../utils/AppError');

const validateRefundInitiation = (req, res, next) => {
  const { amount } = req.body;

  if (amount === undefined || amount === null) {
    return next(new AppError('Refund amount is required', 400));
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return next(new AppError('Amount must be a positive number', 400));
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
  validateRefundInitiation,
  validateObjectId
};
