const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db.prisma');
const AppError = require('../utils/AppError');

// حماية المسارات - فقط المستخدمين المسجلين
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ PRISMA: استخدام prisma.user.findUnique
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!req.user) {
        return next(new AppError('User not found', 404));
      }

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
