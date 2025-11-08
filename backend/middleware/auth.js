const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { AppError, catchAsync } = require('./errorHandler');
const logger = require('../utils/logger');

// Generate JWT token
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Create and send token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user.id, user.role);
  
  // Remove password from output
  const { password, ...userWithoutPassword } = user;
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 24) * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('jwt', token, cookieOptions);
  
  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: userWithoutPassword
    }
  });
};

// Protect routes - verify JWT token
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  
  // 2) Verification token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token! Please log in again.', 401));
    }
    return next(error);
  }
  
  // 3) Check if user still exists
  const query = `
    SELECT id, name, email, role, is_active, created_at, updated_at
    FROM users 
    WHERE id = ? AND is_active = 1
  `;
  
  const users = await executeQuery(query, [decoded.id]);
  
  if (!users || users.length === 0) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }
  
  const currentUser = users[0];
  
  // 4) Check if user changed password after the token was issued
  // This would require a password_changed_at field in the database
  // For now, we'll skip this check
  
  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const query = `
        SELECT id, name, email, role, is_active, created_at, updated_at
        FROM users 
        WHERE id = ? AND is_active = 1
      `;
      
      const users = await executeQuery(query, [decoded.id]);
      
      if (users && users.length > 0) {
        req.user = users[0];
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.warn('Optional auth failed:', error.message);
    }
  }
  
  next();
});

// Check if user owns resource or is admin
const checkOwnership = (resourceIdField = 'user_id') => {
  return (req, res, next) => {
    const resourceUserId = req.body[resourceIdField] || req.params[resourceIdField];
    
    if (req.user.role === 'admin' || req.user.id === parseInt(resourceUserId)) {
      return next();
    }
    
    return next(new AppError('You can only access your own resources', 403));
  };
};

// Rate limiting for authentication endpoints
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for successful requests
    return req.method === 'GET';
  }
});

module.exports = {
  signToken,
  createSendToken,
  protect,
  restrictTo,
  optionalAuth,
  checkOwnership,
  authLimiter
};
