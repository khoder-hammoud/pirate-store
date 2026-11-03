const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
// حماية المسارات - فقط المستخدمين المسجلين
const protect = async (req, res, next) => {
  let token;
// this is unstaged 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
        next(error);
    }
  } else {
   return next(new AppError('Not authorized, no token', 401 ));
  }
};

// فقط للأدمن
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Not authorized as an admin', 403));
  }
};

module.exports = { protect, admin };