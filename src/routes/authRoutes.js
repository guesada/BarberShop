const express = require('express');
const authController = require('../controllers/authController');
const { protect, optionalAuth, authLimiter } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange
} = require('../middleware/validation');

const router = express.Router();

// Public routes with rate limiting
router.use(authLimiter);

// Register new user
router.post('/register', validateUserRegistration, authController.register);

// Login user
router.post('/login', validateUserLogin, authController.login);

// Logout user
router.post('/logout', authController.logout);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.patch('/reset-password/:token', authController.resetPassword);

// Check authentication status (optional auth)
router.get('/check', optionalAuth, authController.checkAuth);

// Protected routes (require authentication)
router.use(protect);

// Get current user
router.get('/me', authController.getMe);

// Update current user
router.patch('/me', authController.updateMe);

// Update password
router.patch('/update-password', validatePasswordChange, authController.updatePassword);

// Delete current user
router.delete('/me', authController.deleteMe);

// Verify email
router.patch('/verify-email/:token', authController.verifyEmail);

module.exports = router;
