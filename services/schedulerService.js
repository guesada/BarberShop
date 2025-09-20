const cron = require('node-cron');
const moment = require('moment');
const pool = require('../config/db');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Scheduler já está rodando');
      return;
    }

    // Executar verificação de lembretes todos os dias às 9:00
    const reminderJob = cron.schedule('0 9 * * *', async () => {
      await this.checkAppointmentReminders();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Executar limpeza de agendamentos antigos toda semana
    const cleanupJob = cron.schedule('0 2 * * 0', async () => {
      await this.cleanupOldAppointments();
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    });

    // Iniciar os jobs
    reminderJob.start();
    cleanupJob.start();

    this.jobs.set('reminderJob', reminderJob);
    this.jobs.set('cleanupJob', cleanupJob);
    this.isRunning = true;

    logger.info('🚀 Scheduler de notificações iniciado');
    logger.info('📅 Verificação de lembretes: todos os dias às 9:00');
    logger.info('🧹 Limpeza de dados: domingos às 2:00');
  }

  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`⏹️ Job ${name} parado`);
    });
    this.jobs.clear();
    this.isRunning = false;
    logger.info('🛑 Scheduler parado');
  }

  async checkAppointmentReminders() {
    try {
      logger.info('🔍 Verificando lembretes de agendamentos...');

      // Data de amanhã
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
      
      // Buscar agendamentos para amanhã que ainda não foram lembrados
      const query = `
        SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.reminder_sent,
          u.name as user_name,
          u.email as user_email,
          b.name as barber_name,
          s.name as service_name,
          s.price
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN users b ON a.barber_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE DATE(a.appointment_date) = ?
        AND a.status = 'confirmed'
        AND (a.reminder_sent = FALSE OR a.reminder_sent IS NULL)
      `;

      const [appointments] = await pool.execute(query, [tomorrow]);

      logger.info(`📋 Encontrados ${appointments.length} agendamentos para lembrar`);

      for (const appointment of appointments) {
        await this.sendAppointmentReminder(appointment);
      }

      logger.info('✅ Verificação de lembretes concluída');
    } catch (error) {
      logger.error('❌ Erro ao verificar lembretes:', error);
    }
  }

  async sendAppointmentReminder(appointment) {
    try {
      const appointmentData = {
        barberName: appointment.barber_name,
        serviceName: appointment.service_name,
        date: moment(appointment.appointment_date).format('DD/MM/YYYY'),
        time: appointment.appointment_time,
        location: 'Elite Barber - Centro'
      };

      // Enviar email de lembrete
      const result = await emailService.sendAppointmentReminder(
        appointment.user_email,
        appointment.user_name,
        appointmentData
      );

      if (result.success) {
        // Marcar como lembrete enviado
        await pool.execute(
          'UPDATE appointments SET reminder_sent = TRUE WHERE id = ?',
          [appointment.id]
        );

        logger.info(`📧 Lembrete enviado para ${appointment.user_email} - Agendamento #${appointment.id}`);
      } else {
        logger.error(`❌ Falha ao enviar lembrete para ${appointment.user_email}:`, result.error);
      }
    } catch (error) {
      logger.error(`❌ Erro ao processar lembrete do agendamento #${appointment.id}:`, error);
    }
  }

  async cleanupOldAppointments() {
    try {
      logger.info('🧹 Iniciando limpeza de agendamentos antigos...');

      // Remover agendamentos cancelados com mais de 30 dias
      const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      const [result] = await pool.execute(`
        DELETE FROM appointments 
        WHERE status = 'cancelled' 
        AND appointment_date < ?
      `, [thirtyDaysAgo]);

      logger.info(`🗑️ Removidos ${result.affectedRows} agendamentos cancelados antigos`);

      // Resetar flag de lembrete para agendamentos futuros (caso necessário)
      await pool.execute(`
        UPDATE appointments 
        SET reminder_sent = FALSE 
        WHERE appointment_date > CURDATE() 
        AND status = 'confirmed'
        AND reminder_sent = TRUE
      `);

      logger.info('✅ Limpeza de dados concluída');
    } catch (error) {
      logger.error('❌ Erro na limpeza de dados:', error);
    }
  }

  // Método para agendar lembrete específico (para novos agendamentos)
  async scheduleReminderForAppointment(appointmentId) {
    try {
      const [appointments] = await pool.execute(`
        SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          u.name as user_name,
          u.email as user_email,
          b.name as barber_name,
          s.name as service_name
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        JOIN users b ON a.barber_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `, [appointmentId]);

      if (appointments.length === 0) {
        logger.warn(`⚠️ Agendamento #${appointmentId} não encontrado`);
        return;
      }

      const appointment = appointments[0];
      const appointmentDate = moment(appointment.appointment_date);
      const reminderDate = appointmentDate.clone().subtract(1, 'day');
      const now = moment();

      // Se o lembrete deve ser enviado hoje ou já passou, enviar imediatamente
      if (reminderDate.isSameOrBefore(now, 'day')) {
        logger.info(`📧 Enviando lembrete imediato para agendamento #${appointmentId}`);
        await this.sendAppointmentReminder(appointment);
      } else {
        logger.info(`⏰ Lembrete agendado para ${reminderDate.format('DD/MM/YYYY')} - Agendamento #${appointmentId}`);
      }
    } catch (error) {
      logger.error(`❌ Erro ao agendar lembrete para agendamento #${appointmentId}:`, error);
    }
  }

  // Método para testar envio de email
  async testEmailReminder(userEmail, userName) {
    const testAppointmentData = {
      barberName: 'Carlos Mendes',
      serviceName: 'Corte + Barba',
      date: moment().add(1, 'day').format('DD/MM/YYYY'),
      time: '14:00',
      location: 'Elite Barber - Centro'
    };

    return await emailService.sendAppointmentReminder(userEmail, userName, testAppointmentData);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      nextReminderCheck: '09:00 (diário)',
      nextCleanup: 'Domingo 02:00'
    };
  }
}

module.exports = new SchedulerService();
