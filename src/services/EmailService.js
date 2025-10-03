const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.isInitialized = true;
      logger.info('📧 Email service initialized successfully');
    } catch (error) {
      logger.error('❌ Email service initialization failed:', error.message);
      // Continue without email service in development
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Running in development mode without email service');
      }
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.isInitialized) {
      logger.warn('⚠️ Email service not initialized, skipping email send');
      return { success: false, message: 'Email service not available' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email sent successfully to ${to}: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendAppointmentReminder(appointment) {
    const { user, barber, service, appointment_date } = appointment;
    
    const subject = `Lembrete: Seu agendamento no ${process.env.BUSINESS_NAME}`;
    const html = this.generateReminderTemplate(appointment);

    return await this.sendEmail(user.email, subject, html);
  }

  async sendAppointmentConfirmation(appointment) {
    const { user } = appointment;
    
    const subject = `Agendamento Confirmado - ${process.env.BUSINESS_NAME}`;
    const html = this.generateConfirmationTemplate(appointment);

    return await this.sendEmail(user.email, subject, html);
  }

  async sendWelcomeEmail(user) {
    const subject = `Bem-vindo ao ${process.env.BUSINESS_NAME}!`;
    const html = this.generateWelcomeTemplate(user);

    return await this.sendEmail(user.email, subject, html);
  }

  generateReminderTemplate(appointment) {
    const { user, barber, service, appointment_date } = appointment;
    const date = new Date(appointment_date);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2D2720, #FF6B35); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ ${process.env.BUSINESS_NAME}</h1>
            <h2>Lembrete de Agendamento</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${user.name}</strong>,</p>
            <p>Este é um lembrete do seu agendamento para amanhã:</p>
            
            <div class="appointment-card">
              <h3>📅 Detalhes do Agendamento</h3>
              <p><strong>Serviço:</strong> ${service.name}</p>
              <p><strong>Barbeiro:</strong> ${barber.name}</p>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>Horário:</strong> ${formattedTime}</p>
              <p><strong>Duração:</strong> ${service.duration} minutos</p>
              <p><strong>Valor:</strong> R$ ${service.price.toFixed(2)}</p>
            </div>

            <p>📍 <strong>Endereço:</strong><br>
            ${process.env.BUSINESS_ADDRESS}</p>

            <p>📞 <strong>Contato:</strong> ${process.env.BUSINESS_PHONE}</p>

            <p>Caso precise cancelar ou reagendar, entre em contato conosco com antecedência.</p>
            
            <p>Aguardamos você!</p>
          </div>
          <div class="footer">
            <p>© 2024 ${process.env.BUSINESS_NAME}. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateConfirmationTemplate(appointment) {
    const { user, barber, service, appointment_date } = appointment;
    const date = new Date(appointment_date);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2D2720, #FF6B35); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ ${process.env.BUSINESS_NAME}</h1>
            <div class="success-badge">✅ Agendamento Confirmado</div>
          </div>
          <div class="content">
            <p>Olá <strong>${user.name}</strong>,</p>
            <p>Seu agendamento foi confirmado com sucesso!</p>
            
            <div class="appointment-card">
              <h3>📅 Detalhes do Agendamento</h3>
              <p><strong>Serviço:</strong> ${service.name}</p>
              <p><strong>Barbeiro:</strong> ${barber.name}</p>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>Horário:</strong> ${formattedTime}</p>
              <p><strong>Duração:</strong> ${service.duration} minutos</p>
              <p><strong>Valor:</strong> R$ ${service.price.toFixed(2)}</p>
            </div>

            <p>📍 <strong>Endereço:</strong><br>
            ${process.env.BUSINESS_ADDRESS}</p>

            <p>📞 <strong>Contato:</strong> ${process.env.BUSINESS_PHONE}</p>

            <p>Você receberá um lembrete 24 horas antes do seu agendamento.</p>
            
            <p>Obrigado por escolher nossos serviços!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2D2720, #FF6B35); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .welcome-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ ${process.env.BUSINESS_NAME}</h1>
            <h2>Bem-vindo!</h2>
          </div>
          <div class="content">
            <div class="welcome-card">
              <h3>🎉 Olá ${user.name}!</h3>
              <p>Seja bem-vindo ao ${process.env.BUSINESS_NAME}!</p>
              <p>Agora você pode agendar seus serviços de forma rápida e prática.</p>
            </div>

            <p>📍 <strong>Nosso endereço:</strong><br>
            ${process.env.BUSINESS_ADDRESS}</p>

            <p>📞 <strong>Contato:</strong> ${process.env.BUSINESS_PHONE}</p>

            <p>Estamos ansiosos para atendê-lo!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
