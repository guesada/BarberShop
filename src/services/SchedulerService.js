const cron = require('cron');
const logger = require('../utils/logger');
const EmailService = require('./EmailService');
const db = require('../config/database');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Schedule daily reminder check
      this.scheduleReminderCheck();
      
      // Schedule cleanup tasks
      this.scheduleCleanupTasks();
      
      this.isInitialized = true;
      logger.info('⏰ Scheduler Service initialized successfully');
    } catch (error) {
      logger.error('❌ Scheduler Service initialization failed:', error.message);
    }
  }

  scheduleReminderCheck() {
    // Run daily at 9:00 AM
    const reminderJob = new cron.CronJob(
      process.env.REMINDER_CRON || '0 9 * * *',
      async () => {
        await this.sendAppointmentReminders();
      },
      null,
      true,
      'America/Sao_Paulo'
    );

    this.jobs.set('reminderCheck', reminderJob);
    logger.info('📅 Daily reminder check scheduled for 9:00 AM');
  }

  scheduleCleanupTasks() {
    // Run cleanup at midnight every day
    const cleanupJob = new cron.CronJob(
      '0 0 * * *',
      async () => {
        await this.cleanupExpiredTokens();
        await this.cleanupOldLogs();
      },
      null,
      true,
      'America/Sao_Paulo'
    );

    this.jobs.set('cleanup', cleanupJob);
    logger.info('🧹 Daily cleanup tasks scheduled for midnight');
  }

  async sendAppointmentReminders() {
    try {
      logger.info('📧 Starting appointment reminder check...');

      // Get appointments for tomorrow that haven't received reminders
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const query = `
        SELECT 
          a.id,
          a.appointment_date,
          a.status,
          a.reminder_sent,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email,
          b.name as barber_name,
          s.name as service_name,
          s.duration,
          s.price
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN barbers br ON a.barber_id = br.id
        JOIN users b ON br.user_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date >= ? 
          AND a.appointment_date < ?
          AND a.status IN ('pending', 'confirmed')
          AND (a.reminder_sent = 0 OR a.reminder_sent IS NULL)
      `;

      const [appointments] = await db.execute(query, [tomorrow, dayAfterTomorrow]);

      logger.info(`📋 Found ${appointments.length} appointments for reminder`);

      for (const appointment of appointments) {
        try {
          // Prepare appointment data for email
          const appointmentData = {
            user: {
              id: appointment.user_id,
              name: appointment.user_name,
              email: appointment.user_email
            },
            barber: {
              name: appointment.barber_name
            },
            service: {
              name: appointment.service_name,
              duration: appointment.duration,
              price: appointment.price
            },
            appointment_date: appointment.appointment_date
          };

          // Send reminder email
          const result = await EmailService.sendAppointmentReminder(appointmentData);

          if (result.success) {
            // Mark reminder as sent
            await db.execute(
              'UPDATE appointments SET reminder_sent = 1 WHERE id = ?',
              [appointment.id]
            );

            logger.info(`✅ Reminder sent for appointment ${appointment.id}`);
          } else {
            logger.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, result.error);
          }

          // Small delay between emails to avoid rate limiting
          await this.delay(1000);

        } catch (error) {
          logger.error(`❌ Error processing reminder for appointment ${appointment.id}:`, error.message);
        }
      }

      logger.info('📧 Appointment reminder check completed');

    } catch (error) {
      logger.error('❌ Error in sendAppointmentReminders:', error.message);
    }
  }

  async cleanupExpiredTokens() {
    try {
      logger.info('🧹 Starting expired tokens cleanup...');

      const query = `
        DELETE FROM password_reset_tokens 
        WHERE expires_at < NOW() OR used = 1
      `;

      const [result] = await db.execute(query);
      logger.info(`🗑️ Cleaned up ${result.affectedRows} expired tokens`);

    } catch (error) {
      logger.error('❌ Error in cleanupExpiredTokens:', error.message);
    }
  }

  async cleanupOldLogs() {
    try {
      logger.info('🧹 Starting old logs cleanup...');

      // Keep logs for 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // This would clean up database logs if we had them
      // For now, just log the action
      logger.info('📝 Log cleanup completed (file-based logs maintained by Winston rotation)');

    } catch (error) {
      logger.error('❌ Error in cleanupOldLogs:', error.message);
    }
  }

  // Schedule a one-time reminder for a specific appointment
  async scheduleAppointmentReminder(appointmentId, appointmentDate) {
    try {
      const reminderTime = new Date(appointmentDate);
      reminderTime.setHours(reminderTime.getHours() - (process.env.REMINDER_HOURS_BEFORE || 24));

      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        const jobName = `reminder_${appointmentId}`;

        const reminderJob = new cron.CronJob(
          reminderTime,
          async () => {
            await this.sendSingleAppointmentReminder(appointmentId);
            // Remove the job after execution
            this.jobs.delete(jobName);
          },
          null,
          true,
          'America/Sao_Paulo'
        );

        this.jobs.set(jobName, reminderJob);
        logger.info(`⏰ Scheduled reminder for appointment ${appointmentId} at ${reminderTime}`);
      }

    } catch (error) {
      logger.error(`❌ Error scheduling reminder for appointment ${appointmentId}:`, error.message);
    }
  }

  async sendSingleAppointmentReminder(appointmentId) {
    try {
      const query = `
        SELECT 
          a.id,
          a.appointment_date,
          a.status,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email,
          b.name as barber_name,
          s.name as service_name,
          s.duration,
          s.price
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN barbers br ON a.barber_id = br.id
        JOIN users b ON br.user_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ? AND a.status IN ('pending', 'confirmed')
      `;

      const [appointments] = await db.execute(query, [appointmentId]);

      if (appointments.length === 0) {
        logger.warn(`⚠️ Appointment ${appointmentId} not found or not eligible for reminder`);
        return;
      }

      const appointment = appointments[0];
      const appointmentData = {
        user: {
          id: appointment.user_id,
          name: appointment.user_name,
          email: appointment.user_email
        },
        barber: {
          name: appointment.barber_name
        },
        service: {
          name: appointment.service_name,
          duration: appointment.duration,
          price: appointment.price
        },
        appointment_date: appointment.appointment_date
      };

      const result = await EmailService.sendAppointmentReminder(appointmentData);

      if (result.success) {
        await db.execute(
          'UPDATE appointments SET reminder_sent = 1 WHERE id = ?',
          [appointmentId]
        );
        logger.info(`✅ Single reminder sent for appointment ${appointmentId}`);
      } else {
        logger.error(`❌ Failed to send single reminder for appointment ${appointmentId}:`, result.error);
      }

    } catch (error) {
      logger.error(`❌ Error sending single reminder for appointment ${appointmentId}:`, error.message);
    }
  }

  // Cancel a scheduled reminder
  cancelAppointmentReminder(appointmentId) {
    const jobName = `reminder_${appointmentId}`;
    const job = this.jobs.get(jobName);
    
    if (job) {
      job.destroy();
      this.jobs.delete(jobName);
      logger.info(`🚫 Cancelled reminder for appointment ${appointmentId}`);
    }
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get scheduler status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }

  // Stop all scheduled jobs
  stopAll() {
    for (const [name, job] of this.jobs) {
      job.destroy();
      logger.info(`🛑 Stopped job: ${name}`);
    }
    this.jobs.clear();
    this.isInitialized = false;
    logger.info('🛑 All scheduler jobs stopped');
  }
}

module.exports = new SchedulerService();
