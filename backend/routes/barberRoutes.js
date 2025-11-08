const express = require('express');
const barberController = require('../controllers/barberController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const {
  validateBarberProfile,
  validateId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', validatePagination, barberController.getAllBarbers);
router.get('/top', barberController.getTopBarbers);
router.get('/:id', validateId, barberController.getBarberById);
router.get('/:id/availability', validateId, validateDateRange, barberController.getBarberAvailability);
router.get('/:id/stats', validateId, barberController.getBarberStats);

// Protected routes (require authentication)
router.use(protect);

// Get current barber profile (for barbers only)
router.get('/me/profile', restrictTo('barber'), barberController.getMyProfile);

// Update current barber profile (for barbers only)
router.patch('/me/profile', restrictTo('barber'), validateBarberProfile, barberController.updateMyProfile);

// Get barber appointments (for barbers only)
router.get('/me/appointments', restrictTo('barber'), barberController.getMyAppointments);

// Get barber dashboard data (for barbers only)
router.get('/me/dashboard', restrictTo('barber'), barberController.getMyDashboard);

// Admin routes
router.use(restrictTo('admin'));

// Create barber profile
router.post('/', validateBarberProfile, barberController.createBarber);

// Update barber profile
router.patch('/:id', validateId, validateBarberProfile, barberController.updateBarber);

// Delete barber profile
router.delete('/:id', validateId, barberController.deleteBarber);

// Bulk operations
router.patch('/bulk-update', barberController.bulkUpdateBarbers);

module.exports = router;
