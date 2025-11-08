const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const {
  validateService,
  validateId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', validatePagination, serviceController.getAllServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/categories', serviceController.getCategories);
router.get('/price-range', serviceController.getPriceRange);
router.get('/search', serviceController.searchServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/barber/:barberId', validateId, serviceController.getServicesForBarber);
router.get('/:id', validateId, serviceController.getServiceById);

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));

// Get service statistics
router.get('/stats/overview', serviceController.getServiceStats);

// Create new service
router.post('/', validateService, serviceController.createService);

// Bulk update services
router.patch('/bulk-update', serviceController.bulkUpdateServices);

// Routes for specific service ID
router.route('/:id')
  .patch(validateId, serviceController.updateService)
  .delete(validateId, serviceController.deleteService);

// Toggle service status
router.patch('/:id/toggle-status', validateId, serviceController.toggleServiceStatus);

module.exports = router;
