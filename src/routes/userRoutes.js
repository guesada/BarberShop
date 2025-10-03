const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserUpdate,
  validateId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Search users (all authenticated users can search)
router.get('/search', userController.searchUsers);

// Get user profile with additional info
router.get('/:id/profile', validateId, userController.getUserProfile);

// Admin only routes
router.use(restrictTo('admin'));

// Get all users with pagination and filters
router.get('/', validatePagination, userController.getAllUsers);

// Get user statistics
router.get('/stats/overview', userController.getUserStats);

// Create new user
router.post('/', validateUserRegistration, userController.createUser);

// Bulk update users
router.patch('/bulk-update', userController.bulkUpdateUsers);

// Routes for specific user ID
router.route('/:id')
  .get(validateId, userController.getUserById)
  .patch(validateId, validateUserUpdate, userController.updateUser)
  .delete(validateId, userController.deleteUser);

// Toggle user active status
router.patch('/:id/toggle-status', validateId, userController.toggleUserStatus);

// Verify user email
router.patch('/:id/verify-email', validateId, userController.verifyUserEmail);

module.exports = router;
