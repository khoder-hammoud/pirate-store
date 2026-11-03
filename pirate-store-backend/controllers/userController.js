const userService = require('../services/userService');
const AppError = require('../utils/AppError');

/**
 * Register User
 */
const registerUser = async (req, res, next) => {
  const user = await userService.registerUser(req.body);

  res.status(201).json(user);
};

/**
 * Login User
 */
const loginUser = async (req, res, next) => {
  const user = await userService.loginUser(
    req.body.email,
    req.body.password
  );

  res.status(200).json(user);
};

/**
 * Get User Profile
 */
const getUserProfile = async (req, res, next) => {
  const user = await userService.getUserProfile(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json(user);
};

/**
 * Update User Profile
 */
const updateUserProfile = async (req, res, next) => {
  const user = await userService.updateUserProfile(
    req.user._id,
    req.body
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json(user);
};

/**
 * Get All Users (Admin)
 */
const getAllUsers = async (req, res, next) => {
  const users = await userService.getAllUsers();

  res.status(200).json(users);
};

/**
 * Delete User by ID (Admin)
 */
const deleteUserById = async (req, res, next) => {
  const result = await userService.deleteUserById(req.params.id);

  if (!result) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json(result);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};