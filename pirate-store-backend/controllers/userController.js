// controllers/userController.js
const userService = require('../services/userService');

/**
 * Register User - POST /api/users/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Register Error:', error);

    if (error.message === 'المستخدم موجود مسبقاً') {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === 'بيانات غير صالحة') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Login User - POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const user = await userService.loginUser(req.body.email, req.body.password);
    res.status(200).json(user);
  } catch (error) {
    console.error('Login Error:', error);

    if (
      error.message === 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    ) {
      return res.status(401).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Get User Profile - GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Update User Profile - PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res.status(200).json(user);
  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * Get All Users - GET /api/users
 * @access Private (Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete User by ID - DELETE /api/users/:id
 * @access Private (Admin)
 */
const deleteUserById = async (req, res) => {
  try {
    const result = await userService.deleteUserById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete User Error:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};