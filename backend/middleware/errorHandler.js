const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle different types of errors
const handleDatabaseError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;
  
  // MySQL specific errors
  if (error.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry. This record already exists.';
    statusCode = 409;
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    message = 'Referenced record does not exist.';
    statusCode = 400;
  } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    message = 'Cannot delete record. It is referenced by other records.';
    statusCode = 409;
  } else if (error.code === 'ER_BAD_FIELD_ERROR') {
    message = 'Invalid field in query.';
    statusCode = 400;
  } else if (error.code === 'ER_PARSE_ERROR') {
    message = 'SQL syntax error.';
    statusCode = 400;
  }
  
  return new AppError(message, statusCode);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors || {}).map(err => err.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // Log error
  logger.logError(err, req);
  
  // API error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Rendered website error
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // API error
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    
    // Programming or other unknown error: don't leak error details
    logger.logError(err, req);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
  
  // Rendered website error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Programming or other unknown error
  logger.logError(err, req);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (error.code && error.code.startsWith('ER_')) {
      error = handleDatabaseError(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync
};
