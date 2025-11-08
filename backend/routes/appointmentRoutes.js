const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');
const {
  validateAppointment,
  validateAppointmentUpdate,
  validateId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Check availability (all authenticated users)
router.get('/check-availability', appointmentController.checkAvailability);

// Get upcoming appointments
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// Get appointment statistics
router.get('/stats', validateDateRange, appointmentController.getAppointmentStats);

// Get appointments by date range
router.get('/date-range', validateDateRange, appointmentController.getAppointmentsByDateRange);

// Get all appointments with filters
router.get('/', validatePagination, appointmentController.getAllAppointments);

// Create new appointment (clients only)
router.post('/', restrictTo('client'), validateAppointment, appointmentController.createAppointment);

// Routes for specific appointment ID
router.route('/:id')
  .get(validateId, appointmentController.getAppointmentById)
  .patch(validateId, validateAppointmentUpdate, appointmentController.updateAppointment);

// Cancel appointment
router.patch('/:id/cancel', validateId, appointmentController.cancelAppointment);

// Confirm appointment (barbers and admins only)
router.patch('/:id/confirm', validateId, restrictTo('barber', 'admin'), appointmentController.confirmAppointment);

// Complete appointment (barbers and admins only)
router.patch('/:id/complete', validateId, restrictTo('barber', 'admin'), appointmentController.completeAppointment);

module.exports = router;
