const User = require('../models/User');
const Barber = require('../models/Barber');
const { createSendToken } = require('../middleware/auth');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Register new user
const register = catchAsync(async (req, res, next) => {
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
  
  // If user is a barber, create barber profile
  if (role === 'barber') {
    await Barber.create(newUser.id, {
      specialties: [],
      bio: '',
      experience_years: 0,
      working_hours: {
        mon: { start: '09:00', end: '18:00' },
        tue: { start: '09:00', end: '18:00' },
        wed: { start: '09:00', end: '18:00' },
        thu: { start: '09:00', end: '18:00' },
        fri: { start: '09:00', end: '18:00' },
        sat: { start: '09:00', end: '16:00' },
        sun: { start: '', end: '' } // Closed on Sunday
      }
    });
  }
  
  logger.info(`New user registered: ${email} (${role})`);
  
  createSendToken(newUser.getProfile(), 201, res, 'User registered successfully');
});

// Login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  
  // Check if user exists and password is correct
  const user = await User.findByEmail(email);

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }
  
  // Check if user is active
  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }
  
  logger.info(`User logged in: ${email}`);
  
  createSendToken(user.getProfile(), 200, res, 'Login successful');
});

// Logout user
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      user: user.getProfile()
    }
  });
});

// Update current user
const updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /update-password.', 400));
  }
  
  // Filter out unwanted fields that are not allowed to be updated
  const filteredBody = {};
  const allowedFields = ['name', 'email', 'phone'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });
  
  // Update user document
  const updatedUser = await User.updateById(req.user.id, filteredBody);
  
  logger.info(`User updated profile: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser.getProfile()
    }
  });
});

// Update password
const updatePassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return next(new AppError('Please provide current password and new password', 400));
  }
  
  // Update password
  await User.updatePassword(req.user.id, current_password, new_password);
  
  logger.info(`User updated password: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Delete current user (soft delete)
const deleteMe = catchAsync(async (req, res, next) => {
  await User.deleteById(req.user.id);
  
  logger.info(`User deleted account: ${req.user.email}`);
  
  res.status(204).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Verify email (placeholder for email verification system)
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  
  // In a real application, you would:
  // 1. Decode the token to get user ID
  // 2. Verify the token is valid and not expired
  // 3. Update user's email_verified status
  
  // For now, we'll just verify the current user
  await User.verifyEmail(req.user.id);
  
  logger.info(`Email verified for user: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Forgot password (placeholder)
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }
  
  const user = await User.findByEmail(email);
  
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  
  // In a real application, you would:
  // 1. Generate a password reset token
  // 2. Save it to the database with expiration
  // 3. Send email with reset link
  
  logger.info(`Password reset requested for: ${email}`);
  
  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to your email'
  });
});

// Reset password (placeholder)
const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }
  
  // In a real application, you would:
  // 1. Find user by reset token
  // 2. Check if token is valid and not expired
  // 3. Update user's password
  // 4. Remove reset token
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// Check authentication status
const checkAuth = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    authenticated: !!req.user,
    user: req.user ? req.user : null
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  updatePassword,
  deleteMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth
};
