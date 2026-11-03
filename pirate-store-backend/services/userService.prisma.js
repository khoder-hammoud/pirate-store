const { prisma } = require('../config/db.prisma');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // ✅ PRISMA: استخدام prisma.user.findUnique
  const userExists = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ PRISMA: استخدام prisma.user.create
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  if (!user) {
    throw new AppError('Invalid user data', 400);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id)
  };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // ✅ PRISMA: استخدام prisma.user.findUnique
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // ✅ Compare password (قد تحتاج إضافة method في model أو استخدام bcrypt مباشرة)
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id)
  };
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  // ✅ PRISMA: استخدام prisma.user.findUnique
  const user = await prisma.user.findUnique({ 
    where: { id: userId } 
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  // ✅ PRISMA: استخدام prisma.user.update
  const user = await prisma.user.findUnique({ 
    where: { id: userId } 
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prepare update data
  const dataToUpdate = {};
  if (updateData.name) dataToUpdate.name = updateData.name;
  if (updateData.email) dataToUpdate.email = updateData.email;
  if (updateData.password) {
    dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
  }

  // ✅ PRISMA: استخدام prisma.user.update
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    token: generateToken(updatedUser.id)
  };
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = async () => {
  // ✅ PRISMA: استخدام prisma.user.findMany
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};

/**
 * Delete user by ID
 */
const deleteUserById = async (userId) => {
  // ✅ PRISMA: استخدام prisma.user.delete
  const user = await prisma.user.delete({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { message: 'User deleted successfully', user };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById
};
