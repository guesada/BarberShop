const Barber = require('../models/Barber');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get all barbers with filters
const getAllBarbers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    specialty,
    available_only,
    min_rating = 0,
    search,
    sortBy = 'rating',
    sortOrder = 'DESC'
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    specialty,
    available_only: available_only === 'true',
    min_rating: parseFloat(min_rating),
    search,
    sortBy,
    sortOrder
  };

  const result = await Barber.findAll(options);

  res.status(200).json({
    success: true,
    message: 'Barbers retrieved successfully',
    data: result.barbers,
    pagination: result.pagination
  });
});

// Get barber by ID
const getBarberById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const barber = await Barber.findById(id);
  
  if (!barber) {
    return next(new AppError('Barber not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Barber retrieved successfully',
    data: {
      barber
    }
  });
});

// Get top barbers
const getTopBarbers = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const barbers = await Barber.getTopBarbers(parseInt(limit));
  
  res.status(200).json({
    success: true,
    message: 'Top barbers retrieved successfully',
    data: barbers
  });
});

// Get barber availability
const getBarberAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return next(new AppError('Date is required', 400));
  }
  
  // Validate date format
  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    return next(new AppError('Invalid date format', 400));
  }
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return next(new AppError('Cannot check availability for past dates', 400));
  }
  
  const availability = await Barber.getAvailability(id, date);
  
  res.status(200).json({
    success: true,
    message: 'Barber availability retrieved successfully',
    data: availability
  });
});

// Get barber statistics
const getBarberStats = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if barber exists
  const barber = await Barber.findById(id);
  if (!barber) {
    return next(new AppError('Barber not found', 404));
  }
  
  const stats = await Barber.getStats(id);
  
  res.status(200).json({
    success: true,
    message: 'Barber statistics retrieved successfully',
    data: stats
  });
});

// Create barber profile (Admin only)
const createBarber = catchAsync(async (req, res, next) => {
  const { user_id, specialties, bio, experience_years, working_hours } = req.body;
  
  // Check if user exists and is a barber
  const user = await User.findById(user_id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  if (user.role !== 'barber') {
    return next(new AppError('User must have barber role', 400));
  }
  
  // Check if barber profile already exists
  const existingBarber = await Barber.findByUserId(user_id);
  if (existingBarber) {
    return next(new AppError('Barber profile already exists for this user', 409));
  }
  
  const barber = await Barber.create(user_id, {
    specialties,
    bio,
    experience_years,
    working_hours
  });
  
  logger.info(`Admin created barber profile for user: ${user.email}`);
  
  res.status(201).json({
    success: true,
    message: 'Barber profile created successfully',
    data: {
      barber
    }
  });
});

// Update barber profile (Admin only)
const updateBarber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const barber = await Barber.findById(id);
  if (!barber) {
    return next(new AppError('Barber not found', 404));
  }
  
  const updatedBarber = await Barber.updateById(id, req.body);
  
  logger.info(`Admin updated barber profile: ${barber.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Barber profile updated successfully',
    data: {
      barber: updatedBarber
    }
  });
});

// Delete barber profile (Admin only)
const deleteBarber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const barber = await Barber.findById(id);
  if (!barber) {
    return next(new AppError('Barber not found', 404));
  }
  
  // In a real application, you might want to soft delete or handle appointments
  // For now, we'll just set is_available to false
  await Barber.updateById(id, { is_available: false });
  
  logger.info(`Admin deactivated barber profile: ${barber.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Barber profile deactivated successfully'
  });
});

// Get current barber profile (for logged-in barber)
const getMyProfile = catchAsync(async (req, res, next) => {
  const barber = await Barber.findByUserId(req.user.id);
  
  if (!barber) {
    return next(new AppError('Barber profile not found. Please contact admin.', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Barber profile retrieved successfully',
    data: {
      barber
    }
  });
});

// Update current barber profile (for logged-in barber)
const updateMyProfile = catchAsync(async (req, res, next) => {
  const barber = await Barber.findByUserId(req.user.id);
  
  if (!barber) {
    return next(new AppError('Barber profile not found. Please contact admin.', 404));
  }
  
  const updatedBarber = await Barber.updateById(barber.id, req.body);
  
  logger.info(`Barber updated own profile: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      barber: updatedBarber
    }
  });
});

// Get current barber's appointments
const getMyAppointments = catchAsync(async (req, res, next) => {
  const barber = await Barber.findByUserId(req.user.id);
  
  if (!barber) {
    return next(new AppError('Barber profile not found. Please contact admin.', 404));
  }
  
  const { limit = 20 } = req.query;
  const appointments = await barber.getUpcomingAppointments(parseInt(limit));
  
  res.status(200).json({
    success: true,
    message: 'Appointments retrieved successfully',
    data: appointments
  });
});

// Get current barber's dashboard data
const getMyDashboard = catchAsync(async (req, res, next) => {
  const barber = await Barber.findByUserId(req.user.id);
  
  if (!barber) {
    return next(new AppError('Barber profile not found. Please contact admin.', 404));
  }
  
  // Get stats and upcoming appointments
  const [stats, upcomingAppointments] = await Promise.all([
    Barber.getStats(barber.id),
    barber.getUpcomingAppointments(5)
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: {
      barber_info: barber,
      stats,
      upcoming_appointments: upcomingAppointments
    }
  });
});

// Bulk update barbers (Admin only)
const bulkUpdateBarbers = catchAsync(async (req, res, next) => {
  const { barber_ids, update_data } = req.body;
  
  if (!Array.isArray(barber_ids) || barber_ids.length === 0) {
    return next(new AppError('Please provide an array of barber IDs', 400));
  }
  
  if (!update_data || Object.keys(update_data).length === 0) {
    return next(new AppError('Please provide update data', 400));
  }
  
  const allowedFields = ['is_available', 'working_hours'];
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
  
  for (const barberId of barber_ids) {
    try {
      const updatedBarber = await Barber.updateById(barberId, filteredUpdateData);
      results.push(updatedBarber);
    } catch (error) {
      errors.push({ barber_id: barberId, error: error.message });
    }
  }
  
  logger.info(`Admin performed bulk update on ${results.length} barbers`);
  
  res.status(200).json({
    success: true,
    message: `Bulk update completed. ${results.length} barbers updated, ${errors.length} errors.`,
    data: {
      updated_barbers: results,
      errors: errors
    }
  });
});

module.exports = {
  getAllBarbers,
  getBarberById,
  getTopBarbers,
  getBarberAvailability,
  getBarberStats,
  createBarber,
  updateBarber,
  deleteBarber,
  getMyProfile,
  updateMyProfile,
  getMyAppointments,
  getMyDashboard,
  bulkUpdateBarbers
};
