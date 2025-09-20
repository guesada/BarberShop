const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configuração para Gmail (pode ser alterada para outros provedores)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password para Gmail
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const mailOptions = {
        from: {
          name: 'Elite Barber',
          address: process.env.EMAIL_USER
        },
        to: to,
        subject: subject,
        html: html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email enviado para ${to}: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`❌ Erro ao enviar email para ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendAppointmentReminder(userEmail, userName, appointmentData) {
    const { barberName, serviceName, date, time, location } = appointmentData;
    
    const subject = '🔔 Lembrete: Seu agendamento é amanhã!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lembrete de Agendamento - Elite Barber</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2180bd;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2180bd;
            margin-bottom: 10px;
          }
          .reminder-card {
            background: linear-gradient(135deg, #2180bd, #1a6b73);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
          }
          .appointment-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-label {
            font-weight: 600;
            color: #495057;
          }
          .detail-value {
            color: #2180bd;
            font-weight: 500;
          }
          .cta-button {
            display: inline-block;
            background: #2180bd;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✂️ Elite Barber</div>
            <p>Experiência premium em barbearia</p>
          </div>

          <div class="reminder-card">
            <h2 style="margin: 0 0 10px 0;">🔔 Lembrete de Agendamento</h2>
            <p style="margin: 0; font-size: 18px;">Olá ${userName}, seu agendamento é amanhã!</p>
          </div>

          <div class="appointment-details">
            <h3 style="margin-top: 0; color: #2180bd;">📅 Detalhes do Agendamento</h3>
            
            <div class="detail-row">
              <span class="detail-label">👤 Cliente:</span>
              <span class="detail-value">${userName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">✂️ Barbeiro:</span>
              <span class="detail-value">${barberName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">💇 Serviço:</span>
              <span class="detail-value">${serviceName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Data:</span>
              <span class="detail-value">${date}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">⏰ Horário:</span>
              <span class="detail-value">${time}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📍 Local:</span>
              <span class="detail-value">${location}</span>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong> Chegue com 10 minutos de antecedência. 
            Em caso de cancelamento, avise com pelo menos 2 horas de antecedência.
          </div>

          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="cta-button">
              🔗 Acessar Meus Agendamentos
            </a>
          </div>

          <div class="footer">
            <p><strong>Elite Barber</strong></p>
            <p>📧 Você está recebendo este email porque tem um agendamento confirmado.</p>
            <p>📞 Para cancelar ou reagendar, entre em contato: (11) 99999-9999</p>
            <p style="margin-top: 15px; font-size: 12px;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendAppointmentConfirmation(userEmail, userName, appointmentData) {
    const { barberName, serviceName, date, time, location } = appointmentData;
    
    const subject = '✅ Agendamento Confirmado - Elite Barber';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2180bd; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✂️ Elite Barber</h1>
            <h2>Agendamento Confirmado!</h2>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Seu agendamento foi confirmado com sucesso! 🎉</p>
            
            <h3>📋 Detalhes:</h3>
            <ul>
              <li><strong>Barbeiro:</strong> ${barberName}</li>
              <li><strong>Serviço:</strong> ${serviceName}</li>
              <li><strong>Data:</strong> ${date}</li>
              <li><strong>Horário:</strong> ${time}</li>
              <li><strong>Local:</strong> ${location}</li>
            </ul>
            
            <p><strong>⏰ Lembrete:</strong> Você receberá um email de lembrete 1 dia antes do agendamento.</p>
          </div>
          <div class="footer">
            <p>Elite Barber - Experiência premium em barbearia</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Conexão com servidor de email verificada');
      return true;
    } catch (error) {
      logger.error('❌ Erro na conexão com servidor de email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
