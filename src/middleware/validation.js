const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['client', 'barber', 'admin'])
    .withMessage('Role must be client, barber, or admin'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  handleValidationErrors
];

// Barber validation rules
const validateBarberProfile = [
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array'),
    
  body('specialties.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each specialty must be between 2 and 50 characters'),
    
  body('working_hours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
    
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
    
  handleValidationErrors
];

// Service validation rules
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
    
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
    
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
    
  handleValidationErrors
];

// Appointment validation rules
const validateAppointment = [
  body('barber_id')
    .isInt({ min: 1 })
    .withMessage('Valid barber ID is required'),
    
  body('service_id')
    .isInt({ min: 1 })
    .withMessage('Valid service ID is required'),
    
  body('appointment_date')
    .isISO8601()
    .withMessage('Valid appointment date is required (ISO 8601 format)')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      
      if (appointmentDate <= now) {
        throw new Error('Appointment date must be in the future');
      }
      
      // Check if appointment is not more than 3 months in advance
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      if (appointmentDate > threeMonthsFromNow) {
        throw new Error('Appointment date cannot be more than 3 months in advance');
      }
      
      return true;
    }),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
    
  handleValidationErrors
];

const validateAppointmentUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be pending, confirmed, completed, or cancelled'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
    
  handleValidationErrors
];

// Parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required'),
    
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+:(asc|desc)$/)
    .withMessage('Sort format must be field:direction (e.g., name:asc)'),
    
  handleValidationErrors
];

const validateDateRange = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
    
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format')
    .custom((value, { req }) => {
      if (req.query.start_date && value) {
        const startDate = new Date(req.query.start_date);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
    
  handleValidationErrors
];

// Password validation
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('new_password')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateBarberProfile,
  validateService,
  validateAppointment,
  validateAppointmentUpdate,
  validateId,
  validatePagination,
  validateDateRange,
  validatePasswordChange
};
