const Appointment = require('../models/Appointment');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Create new appointment
const createAppointment = catchAsync(async (req, res, next) => {
  const { barber_id, service_id, appointment_date, notes } = req.body;
  const user_id = req.user.id;
  
  // Validate barber exists
  const barber = await Barber.findById(barber_id);
  if (!barber) {
    return next(new AppError('Barber not found', 404));
  }
  
  // Validate service exists
  const service = await Service.findById(service_id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  
  // Validate appointment date is in the future
  const appointmentDateTime = new Date(appointment_date);
  const now = new Date();
  
  if (appointmentDateTime <= now) {
    return next(new AppError('Appointment date must be in the future', 400));
  }
  
  // Check if barber is available at the requested time
  const isAvailable = await barber.isAvailableAt(appointmentDateTime);
  if (!isAvailable) {
    return next(new AppError('Barber is not available at the requested time', 409));
  }
  
  const appointment = await Appointment.create({
    user_id,
    barber_id,
    service_id,
    appointment_date,
    notes
  });
  
  logger.info(`New appointment created: ${appointment.id} for user ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    message: 'Appointment created successfully',
    data: {
      appointment
    }
  });
});

// Get all appointments with filters
const getAllAppointments = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    user_id,
    barber_id,
    status,
    start_date,
    end_date,
    sortBy = 'appointment_date',
    sortOrder = 'DESC'
  } = req.query;

  // Check permissions
  if (req.user.role === 'client' && user_id && parseInt(user_id) !== req.user.id) {
    return next(new AppError('You can only view your own appointments', 403));
  }
  
  if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }
    
    if (barber_id && parseInt(barber_id) !== barber.id) {
      return next(new AppError('You can only view your own appointments', 403));
    }
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    user_id: req.user.role === 'client' ? req.user.id : user_id,
    barber_id: req.user.role === 'barber' ? (await Barber.findByUserId(req.user.id))?.id : barber_id,
    status,
    start_date,
    end_date,
    sortBy,
    sortOrder
  };

  const result = await Appointment.findAll(options);

  res.status(200).json({
    success: true,
    message: 'Appointments retrieved successfully',
    data: result.appointments,
    pagination: result.pagination
  });
});

// Get appointment by ID
const getAppointmentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  // Check permissions
  if (req.user.role === 'client' && appointment.user_id !== req.user.id) {
    return next(new AppError('You can only view your own appointments', 403));
  }
  
  if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber || appointment.barber_id !== barber.id) {
      return next(new AppError('You can only view your own appointments', 403));
    }
  }
  
  res.status(200).json({
    success: true,
    message: 'Appointment retrieved successfully',
    data: {
      appointment
    }
  });
});

// Update appointment
const updateAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  // Check permissions
  let canUpdate = false;
  
  if (req.user.role === 'admin') {
    canUpdate = true;
  } else if (req.user.role === 'client' && appointment.user_id === req.user.id) {
    // Clients can only update their own appointments and only certain fields
    const allowedFields = ['appointment_date', 'notes'];
    const hasInvalidFields = Object.keys(req.body).some(key => !allowedFields.includes(key));
    
    if (hasInvalidFields) {
      return next(new AppError('You can only update appointment date and notes', 403));
    }
    
    if (!appointment.canBeModified()) {
      return next(new AppError('Appointment cannot be modified (less than 2 hours away or already completed/cancelled)', 400));
    }
    
    canUpdate = true;
  } else if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (barber && appointment.barber_id === barber.id) {
      // Barbers can update status and notes
      const allowedFields = ['status', 'notes'];
      const hasInvalidFields = Object.keys(req.body).some(key => !allowedFields.includes(key));
      
      if (hasInvalidFields) {
        return next(new AppError('You can only update appointment status and notes', 403));
      }
      
      canUpdate = true;
    }
  }
  
  if (!canUpdate) {
    return next(new AppError('You do not have permission to update this appointment', 403));
  }
  
  const updatedAppointment = await Appointment.updateById(id, req.body);
  
  logger.info(`Appointment updated: ${id} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: {
      appointment: updatedAppointment
    }
  });
});

// Cancel appointment
const cancelAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  // Check permissions
  let canCancel = false;
  
  if (req.user.role === 'admin') {
    canCancel = true;
  } else if (req.user.role === 'client' && appointment.user_id === req.user.id) {
    if (!appointment.canBeCancelled()) {
      return next(new AppError('Appointment cannot be cancelled (less than 1 hour away or already completed/cancelled)', 400));
    }
    canCancel = true;
  } else if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (barber && appointment.barber_id === barber.id) {
      canCancel = true;
    }
  }
  
  if (!canCancel) {
    return next(new AppError('You do not have permission to cancel this appointment', 403));
  }
  
  const cancelledAppointment = await Appointment.cancelById(id);
  
  logger.info(`Appointment cancelled: ${id} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: {
      appointment: cancelledAppointment
    }
  });
});

// Get upcoming appointments
const getUpcomingAppointments = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  let options = { limit: parseInt(limit) };
  
  if (req.user.role === 'client') {
    options.user_id = req.user.id;
  } else if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }
    options.barber_id = barber.id;
  }
  
  const appointments = await Appointment.getUpcoming(options);
  
  res.status(200).json({
    success: true,
    message: 'Upcoming appointments retrieved successfully',
    data: appointments
  });
});

// Get appointment statistics
const getAppointmentStats = catchAsync(async (req, res, next) => {
  const { start_date, end_date } = req.query;
  
  let options = { start_date, end_date };
  
  if (req.user.role === 'client') {
    options.user_id = req.user.id;
  } else if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }
    options.barber_id = barber.id;
  }
  
  const stats = await Appointment.getStats(options);
  
  res.status(200).json({
    success: true,
    message: 'Appointment statistics retrieved successfully',
    data: stats
  });
});

// Get appointments by date range
const getAppointmentsByDateRange = catchAsync(async (req, res, next) => {
  const { start_date, end_date } = req.query;
  
  if (!start_date || !end_date) {
    return next(new AppError('Start date and end date are required', 400));
  }
  
  let options = {};
  
  if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }
    options.barber_id = barber.id;
  }
  
  const appointments = await Appointment.getByDateRange(start_date, end_date, options);
  
  res.status(200).json({
    success: true,
    message: 'Appointments retrieved successfully',
    data: appointments
  });
});

// Confirm appointment (Barber only)
const confirmAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user.role !== 'barber' && req.user.role !== 'admin') {
    return next(new AppError('Only barbers can confirm appointments', 403));
  }
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber || appointment.barber_id !== barber.id) {
      return next(new AppError('You can only confirm your own appointments', 403));
    }
  }
  
  if (appointment.status !== 'pending') {
    return next(new AppError('Only pending appointments can be confirmed', 400));
  }
  
  const confirmedAppointment = await Appointment.updateById(id, { status: 'confirmed' });
  
  logger.info(`Appointment confirmed: ${id} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: {
      appointment: confirmedAppointment
    }
  });
});

// Complete appointment (Barber only)
const completeAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (req.user.role !== 'barber' && req.user.role !== 'admin') {
    return next(new AppError('Only barbers can complete appointments', 403));
  }
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  if (req.user.role === 'barber') {
    const barber = await Barber.findByUserId(req.user.id);
    if (!barber || appointment.barber_id !== barber.id) {
      return next(new AppError('You can only complete your own appointments', 403));
    }
  }
  
  if (appointment.status !== 'confirmed') {
    return next(new AppError('Only confirmed appointments can be completed', 400));
  }
  
  const completedAppointment = await Appointment.updateById(id, { status: 'completed' });
  
  logger.info(`Appointment completed: ${id} by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Appointment completed successfully',
    data: {
      appointment: completedAppointment
    }
  });
});

// Check time slot availability
const checkAvailability = catchAsync(async (req, res, next) => {
  const { barber_id, service_id, appointment_date } = req.query;
  
  if (!barber_id || !service_id || !appointment_date) {
    return next(new AppError('Barber ID, service ID, and appointment date are required', 400));
  }
  
  const isAvailable = await Appointment.isTimeSlotAvailable(
    parseInt(barber_id),
    appointment_date,
    parseInt(service_id)
  );
  
  res.status(200).json({
    success: true,
    message: 'Availability checked successfully',
    data: {
      available: isAvailable,
      barber_id: parseInt(barber_id),
      service_id: parseInt(service_id),
      appointment_date
    }
  });
});

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getUpcomingAppointments,
  getAppointmentStats,
  getAppointmentsByDateRange,
  confirmAppointment,
  completeAppointment,
  checkAvailability
};
