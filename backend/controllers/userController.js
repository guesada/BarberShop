const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get all users (Admin only)
const getAllUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    search,
    sortBy,
    sortOrder
  };

  const result = await User.findAll(options);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result.users,
    pagination: result.pagination
  });
});

// Get user by ID
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check if user can access this profile
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return next(new AppError('You can only access your own profile', 403));
  }
  
  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: user.getProfile()
    }
  });
});

// Create user (Admin only)
const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User with this email already exists', 409));
  }
  
  // Create user
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'client',
    phone
  });
  
  logger.info(`Admin created new user: ${email} (${role})`);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: newUser.getProfile()
    }
  });
});

// Update user (Admin or own profile)
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check permissions
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return next(new AppError('You can only update your own profile', 403));
  }
  
  // Filter allowed fields based on role
  const allowedFields = req.user.role === 'admin' 
    ? ['name', 'email', 'phone', 'role', 'is_active', 'email_verified']
    : ['name', 'email', 'phone'];
  
  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });
  
  if (Object.keys(updateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }
  
  // Update user
  const updatedUser = await User.updateById(id, updateData);
  
  logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.getProfile()
    }
  });
});

// Delete user (Admin only - soft delete)
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
    return next(new AppError('You cannot delete your own account', 400));
  }
  
  // Delete user
  await User.deleteById(id);
  
  logger.info(`Admin deleted user: ${user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get user statistics (Admin only)
const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.getUserStats();
  
  // Calculate totals
  const totalUsers = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalActive = stats.reduce((sum, stat) => sum + stat.active_count, 0);
  const totalVerified = stats.reduce((sum, stat) => sum + stat.verified_count, 0);
  
  res.status(200).json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: {
      by_role: stats,
      totals: {
        total_users: totalUsers,
        active_users: totalActive,
        verified_users: totalVerified,
        inactive_users: totalUsers - totalActive,
        unverified_users: totalUsers - totalVerified
      }
    }
  });
});

// Activate/Deactivate user (Admin only)
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  if (typeof is_active !== 'boolean') {
    return next(new AppError('is_active must be a boolean value', 400));
  }
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Prevent admin from deactivating themselves
  if (req.user.id === parseInt(id) && !is_active) {
    return next(new AppError('You cannot deactivate your own account', 400));
  }
  
  // Update user status
  const updatedUser = await User.updateById(id, { is_active });
  
  const action = is_active ? 'activated' : 'deactivated';
  logger.info(`Admin ${action} user: ${updatedUser.email}`);
  
  res.status(200).json({
    success: true,
    message: `User ${action} successfully`,
    data: {
      user: updatedUser.getProfile()
    }
  });
});

// Verify user email (Admin only)
const verifyUserEmail = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  if (user.email_verified) {
    return next(new AppError('User email is already verified', 400));
  }
  
  // Verify email
  await User.verifyEmail(id);
  
  logger.info(`Admin verified email for user: ${user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'User email verified successfully'
  });
});

// Search users
const searchUsers = catchAsync(async (req, res, next) => {
  const { q, role, limit = 10 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters long', 400));
  }
  
  const options = {
    search: q.trim(),
    role,
    limit: parseInt(limit),
    page: 1
  };
  
  const result = await User.findAll(options);
  
  res.status(200).json({
    success: true,
    message: 'Search completed successfully',
    data: result.users,
    total: result.pagination.total
  });
});

// Get user profile with additional info
const getUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check permissions
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return next(new AppError('You can only access your own profile', 403));
  }
  
  // Get additional profile data based on role
  let additionalData = {};
  
  if (user.role === 'barber') {
    const Barber = require('../models/Barber');
    const barberProfile = await Barber.findByUserId(id);
    if (barberProfile) {
      additionalData.barber_profile = barberProfile;
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: user.getProfile(),
      ...additionalData
    }
  });
});

// Bulk operations (Admin only)
const bulkUpdateUsers = catchAsync(async (req, res, next) => {
  const { user_ids, update_data } = req.body;
  
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return next(new AppError('Please provide an array of user IDs', 400));
  }
  
  if (!update_data || Object.keys(update_data).length === 0) {
    return next(new AppError('Please provide update data', 400));
  }
  
  const allowedFields = ['is_active', 'email_verified'];
  const filteredUpdateData = {};
  
  Object.keys(update_data).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = update_data[key];
    }
  });
  
  if (Object.keys(filteredUpdateData).length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }
  
  const results = [];
  const errors = [];
  
  for (const userId of user_ids) {
    try {
      // Don't allow admin to bulk update themselves
      if (req.user.id === parseInt(userId)) {
        errors.push({ user_id: userId, error: 'Cannot bulk update your own account' });
        continue;
      }
      
      const updatedUser = await User.updateById(userId, filteredUpdateData);
      results.push(updatedUser.getProfile());
    } catch (error) {
      errors.push({ user_id: userId, error: error.message });
    }
  }
  
  logger.info(`Admin performed bulk update on ${results.length} users`);
  
  res.status(200).json({
    success: true,
    message: `Bulk update completed. ${results.length} users updated, ${errors.length} errors.`,
    data: {
      updated_users: results,
      errors: errors
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus,
  verifyUserEmail,
  searchUsers,
  getUserProfile,
  bulkUpdateUsers
};
