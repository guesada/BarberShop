const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();
// Validate env vars
require('./backend/config/validateEnv')();

const authRoutes = require('./backend/routes/authRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const barberRoutes = require('./backend/routes/barberRoutes');
const appointmentRoutes = require('./backend/routes/appointmentRoutes');
const serviceRoutes = require('./backend/routes/serviceRoutes');
const notificationRoutes = require('./backend/routes/notificationRoutes');

const { errorHandler } = require('./backend/middleware/errorHandler');
const logger = require('./backend/utils/logger');
const morgan = require('morgan');
const setupSwagger = require('./backend/config/swagger');

// Initialize services
const EmailService = require('./backend/services/EmailService');
const SchedulerService = require('./backend/services/SchedulerService');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from /public (site sem React)
app.use(express.static(path.join(__dirname, 'public')));

// HTTP request logging (morgan + winston)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Swagger docs
setupSwagger(app);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route should serve the static site (public/index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize Email Service
    if (process.env.NOTIFICATION_ENABLED === 'true') {
      await EmailService.initialize();
      logger.info('📧 Email Service initialized successfully');
    }

    // Initialize Scheduler Service
    if (process.env.SCHEDULER_ENABLED === 'true') {
      await SchedulerService.initialize();
      logger.info('⏰ Scheduler Service initialized successfully');
    }
  } catch (error) {
    logger.error('❌ Error initializing services:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  logger.info(`🚀 BarberShop Elite API Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
  logger.info(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
  
  // Initialize services after server starts
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
