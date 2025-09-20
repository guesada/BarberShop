const express = require('express');
const router = express.Router();
const schedulerService = require('../services/schedulerService');
const emailService = require('../services/emailService');
const { authenticateToken, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ===== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) =====

// Status público do sistema (informações básicas)
router.get('/status-public', asyncHandler(async (req, res) => {
  console.log('📊 Acessando status público das notificações');
  
  const status = schedulerService.getStatus();
  
  res.json({
    success: true,
    data: {
      scheduler: {
        isRunning: status.isRunning,
        nextReminderCheck: status.nextReminderCheck,
        nextCleanup: status.nextCleanup
      },
      email: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
      },
      environment: process.env.NODE_ENV || 'development'
    }
  });
}));

// Rota pública para testar email (apenas para desenvolvimento)
router.post('/test-email-public', asyncHandler(async (req, res) => {
  console.log('📧 Testando envio de email via rota pública');
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Esta rota não está disponível em produção'
    });
  }

  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }
  
  const result = await schedulerService.testEmailReminder(
    email, 
    name || 'Usuário Teste'
  );
  
  if (result.success) {
    logger.info(`📧 Email de teste enviado para ${email} via rota pública`);
    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
      data: { messageId: result.messageId }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Falha ao enviar email de teste',
      error: result.error
    });
  }
}));

// ===== ROTAS PROTEGIDAS (COM AUTENTICAÇÃO) =====

// Middleware de autenticação aplicado apenas às rotas abaixo
router.use(authenticateToken);
router.use(authorize('admin'));

// Status do sistema de notificações
router.get('/status', asyncHandler(async (req, res) => {
  const status = schedulerService.getStatus();
  
  res.json({
    success: true,
    data: {
      scheduler: status,
      email: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        user: process.env.EMAIL_USER || 'Não configurado'
      }
    }
  });
}));

// Testar envio de email
router.post('/test-email', asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }
  
  const result = await schedulerService.testEmailReminder(
    email, 
    name || 'Usuário Teste'
  );
  
  if (result.success) {
    logger.info(`📧 Email de teste enviado para ${email} por admin ${req.user.email}`);
    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
      data: { messageId: result.messageId }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Falha ao enviar email de teste',
      error: result.error
    });
  }
}));

// Verificar lembretes manualmente
router.post('/check-reminders', asyncHandler(async (req, res) => {
  logger.info(`🔍 Verificação manual de lembretes iniciada por admin ${req.user.email}`);
  
  // Executar verificação em background
  schedulerService.checkAppointmentReminders()
    .then(() => {
      logger.info('✅ Verificação manual de lembretes concluída');
    })
    .catch(error => {
      logger.error('❌ Erro na verificação manual de lembretes:', error);
    });
  
  res.json({
    success: true,
    message: 'Verificação de lembretes iniciada em background'
  });
}));

// Agendar lembrete para agendamento específico
router.post('/schedule-reminder/:appointmentId', asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  
  if (!appointmentId || isNaN(appointmentId)) {
    return res.status(400).json({
      success: false,
      message: 'ID do agendamento inválido'
    });
  }
  
  await schedulerService.scheduleReminderForAppointment(parseInt(appointmentId));
  
  logger.info(`⏰ Lembrete agendado para appointment #${appointmentId} por admin ${req.user.email}`);
  
  res.json({
    success: true,
    message: `Lembrete agendado para agendamento #${appointmentId}`
  });
}));

// Reiniciar scheduler
router.post('/restart-scheduler', asyncHandler(async (req, res) => {
  logger.info(`🔄 Reiniciando scheduler por admin ${req.user.email}`);
  
  schedulerService.stop();
  schedulerService.start();
  
  res.json({
    success: true,
    message: 'Scheduler reiniciado com sucesso'
  });
}));

// Parar scheduler
router.post('/stop-scheduler', asyncHandler(async (req, res) => {
  logger.info(`⏹️ Parando scheduler por admin ${req.user.email}`);
  
  schedulerService.stop();
  
  res.json({
    success: true,
    message: 'Scheduler parado'
  });
}));

// Iniciar scheduler
router.post('/start-scheduler', asyncHandler(async (req, res) => {
  logger.info(`▶️ Iniciando scheduler por admin ${req.user.email}`);
  
  schedulerService.start();
  
  res.json({
    success: true,
    message: 'Scheduler iniciado'
  });
}));

// Enviar email de confirmação de agendamento
router.post('/send-confirmation/:appointmentId', asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const pool = require('../config/db');
  
  // Buscar dados do agendamento
  const [appointments] = await pool.execute(`
    SELECT 
      a.id,
      a.appointment_date,
      a.appointment_time,
      u.name as user_name,
      u.email as user_email,
      b.name as barber_name,
      s.name as service_name,
      s.price
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN users b ON a.barber_id = b.id
    JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
  `, [appointmentId]);
  
  if (appointments.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Agendamento não encontrado'
    });
  }
  
  const appointment = appointments[0];
  const moment = require('moment');
  
  const appointmentData = {
    barberName: appointment.barber_name,
    serviceName: appointment.service_name,
    date: moment(appointment.appointment_date).format('DD/MM/YYYY'),
    time: appointment.appointment_time,
    location: 'Elite Barber - Centro'
  };
  
  const result = await emailService.sendAppointmentConfirmation(
    appointment.user_email,
    appointment.user_name,
    appointmentData
  );
  
  if (result.success) {
    logger.info(`📧 Email de confirmação enviado para ${appointment.user_email} - Agendamento #${appointmentId}`);
    res.json({
      success: true,
      message: 'Email de confirmação enviado com sucesso'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Falha ao enviar email de confirmação',
      error: result.error
    });
  }
}));

module.exports = router;
