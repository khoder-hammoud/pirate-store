// services/userService.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('المستخدم موجود مسبقاً');
  }

  // Create new user (password will be hashed automatically in model)
  const user = await User.create({
    name,
    email,
    password
  });

  if (!user) {
    throw new Error('بيانات غير صالحة');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  };
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.name) {
    user.name = updateData.name;
  }

  if (updateData.email) {
    user.email = updateData.email;
  }

  if (updateData.password) {
    user.password = updateData.password; // Will be hashed automatically
  }

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    token: generateToken(updatedUser._id)
  };
};

/**
 * Get all users
 */
const getAllUsers = async () => {
  return await User.find().select('-password');
};

/**
 * Delete user by ID
 */
const deleteUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  await user.remove();

  return {
    message: 'User removed successfully'
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};
