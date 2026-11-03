const mongoose  = require('mongoose');
const AppError = require('../../utils/AppError');


const validateUserRegistration = (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return next(new AppError('Name, email, and password are required', 400));
    }
    if(req.body.name.length < 3) {
        return next(new AppError('Name must be at least 3 characters long', 400));
    }
    if (req.body.password.length < 6) {
        return next(new AppError('Password must be at least 6 characters long', 400));
    }
    if (!/\S+@\S+\.\S+/.test(req.body.email)) {
        return next(new AppError('Invalid email format', 400));
    }
    next(); 
};

const validateUserLogin = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return next(new AppError('Email and password are required', 400));
    }
    next();
};

const validateUserProfileUpdate = (req, res, next) => {
    if (!req.body.name && !req.body.email && !req.body.password) {
        return next(new AppError('At least one field (name, email, or password) must be provided for update', 400));
    }
    if (req.body.name && req.body.name.length < 3) {
        return next(new AppError('Name must be at least 3 characters long', 400));
    }
    if (req.body.password && req.body.password.length < 6) {
        return next(new AppError('Password must be at least 6 characters long', 400));
    }   
    if (req.body.email && !/\S+@\S+\.\S+/.test(req.body.email)) {
        return next(new AppError('Invalid email format', 400));
    }   
    next();
}; 

const validateUserdelete = (req, res, next) => {
if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid user ID', 400));
}
    next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserProfileUpdate,
  validateUserdelete    
}