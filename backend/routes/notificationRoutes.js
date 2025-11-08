const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const EmailService = require('../services/EmailService');
const SchedulerService = require('../services/SchedulerService');
const logger = require('../utils/logger');

const router = express.Router();

// Public routes for testing (no auth required)
router.get('/status-public', (req, res) => {
  try {
    const emailStatus = EmailService.isInitialized;
    const schedulerStatus = SchedulerService.getStatus();

    res.status(200).json({
      success: true,
      data: {
        email: {
          initialized: emailStatus,
          enabled: process.env.NOTIFICATION_ENABLED === 'true'
        },
        scheduler: schedulerStatus,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    logger.error('Error getting notification status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification status'
    });
  }
});

router.post('/test-email-public', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('type').optional().isIn(['welcome', 'reminder', 'confirmation']).withMessage('Invalid email type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, type = 'welcome' } = req.body;

    let result;
    const testUser = {
      name: 'Usuário Teste',
      email: email
    };

    switch (type) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(testUser);
        break;
      
      case 'reminder':
        const testAppointment = {
          user: testUser,
          barber: { name: 'João Silva' },
          service: { name: 'Corte + Barba', duration: 60, price: 50.00 },
          appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        };
        result = await EmailService.sendAppointmentReminder(testAppointment);
        break;
      
      case 'confirmation':
        const testConfirmation = {
          user: testUser,
          barber: { name: 'Pedro Santos' },
          service: { name: 'Corte Social', duration: 30, price: 30.00 },
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
        };
        result = await EmailService.sendAppointmentConfirmation(testConfirmation);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type'
        });
    }

    res.status(200).json({
      success: true,
      message: `Test ${type} email sent successfully`,
      data: result
    });

  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

// Protected routes (require authentication)
router.use(protect);

// Get notification settings
router.get('/settings', async (req, res) => {
  try {
    const settings = {
      emailEnabled: process.env.NOTIFICATION_ENABLED === 'true',
      reminderHours: parseInt(process.env.REMINDER_HOURS_BEFORE) || 24,
      schedulerEnabled: process.env.SCHEDULER_ENABLED === 'true',
      businessInfo: {
        name: process.env.BUSINESS_NAME,
        phone: process.env.BUSINESS_PHONE,
        address: process.env.BUSINESS_ADDRESS
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification settings'
    });
  }
});

// Send welcome email to user
router.post('/welcome', [
  body('userId').isInt().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.body;

    // Get user data (you would fetch from database)
    const user = {
      id: userId,
      name: 'User Name', // Replace with actual user data
      email: 'user@email.com' // Replace with actual user data
    };

    const result = await EmailService.sendWelcomeEmail(user);

    res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending welcome email'
    });
  }
});

// Send appointment confirmation
router.post('/appointment-confirmation', [
  body('appointmentId').isInt().withMessage('Valid appointment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { appointmentId } = req.body;

    // Here you would fetch the appointment data from database
    // For now, using mock data
    const appointment = {
      user: { name: 'Cliente', email: 'cliente@email.com' },
      barber: { name: 'Barbeiro' },
      service: { name: 'Serviço', duration: 60, price: 50.00 },
      appointment_date: new Date()
    };

    const result = await EmailService.sendAppointmentConfirmation(appointment);

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending confirmation email'
    });
  }
});

// Schedule appointment reminder
router.post('/schedule-reminder', [
  body('appointmentId').isInt().withMessage('Valid appointment ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { appointmentId, appointmentDate } = req.body;

    await SchedulerService.scheduleAppointmentReminder(appointmentId, new Date(appointmentDate));

    res.status(200).json({
      success: true,
      message: 'Reminder scheduled successfully'
    });

  } catch (error) {
    logger.error('Error scheduling reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling reminder'
    });
  }
});

// Cancel appointment reminder
router.delete('/cancel-reminder/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    SchedulerService.cancelAppointmentReminder(parseInt(appointmentId));

    res.status(200).json({
      success: true,
      message: 'Reminder cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling reminder'
    });
  }
});

// Admin only routes
router.use(restrictTo('admin'));

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      schedulerStatus: SchedulerService.getStatus(),
      emailService: {
        initialized: EmailService.isInitialized,
        enabled: process.env.NOTIFICATION_ENABLED === 'true'
      },
      settings: {
        reminderHours: parseInt(process.env.REMINDER_HOURS_BEFORE) || 24,
        cronSchedule: process.env.REMINDER_CRON || '0 9 * * *'
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification stats'
    });
  }
});

// Manually trigger reminder check (admin only)
router.post('/trigger-reminders', async (req, res) => {
  try {
    // This would trigger the reminder check manually
    await SchedulerService.sendAppointmentReminders();

    res.status(200).json({
      success: true,
      message: 'Reminder check triggered successfully'
    });

  } catch (error) {
    logger.error('Error triggering reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering reminders'
    });
  }
});

module.exports = router;
