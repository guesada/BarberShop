const pool = require('../config/db');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class AppointmentController {
  // Criar agendamento
  async createAppointment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { barberId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
      const clientId = req.user.id;

      // Verificar se o barbeiro existe e está ativo
      const [barberCheck] = await pool.query(`
        SELECT u.id, u.name, b.is_available 
        FROM users u 
        JOIN barbers b ON u.id = b.user_id 
        WHERE u.id = ? AND u.user_type = 'barbeiro' AND u.is_active = TRUE
      `, [barberId]);

      if (barberCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Barbeiro não encontrado ou indisponível'
        });
      }

      if (!barberCheck[0].is_available) {
        return res.status(400).json({
          success: false,
          message: 'Barbeiro não está disponível para agendamentos'
        });
      }

      // Verificar se o serviço existe
      const [serviceCheck] = await pool.query(
        'SELECT id, name, price, duration FROM services WHERE id = ? AND is_active = TRUE',
        [serviceId]
      );

      if (serviceCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Serviço não encontrado'
        });
      }

      // Verificar se o horário está disponível
      const [conflictCheck] = await pool.query(`
        SELECT id FROM appointments 
        WHERE barber_id = ? AND appointment_date = ? AND appointment_time = ? 
        AND status NOT IN ('cancelado')
      `, [barberId, appointmentDate, appointmentTime]);

      if (conflictCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Horário não disponível'
        });
      }

      const service = serviceCheck[0];
      const totalPrice = service.price;

      // Criar agendamento
      const sql = `
        INSERT INTO appointments (client_id, barber_id, service_id, appointment_date, appointment_time, total_price, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [
        clientId, barberId, serviceId, appointmentDate, appointmentTime, totalPrice, notes
      ]);

      logger.info(`Agendamento criado: ID ${result.insertId} - Cliente ${clientId} com Barbeiro ${barberId}`);

      res.status(201).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        data: {
          id: result.insertId,
          clientId,
          barberId,
          serviceId,
          appointmentDate,
          appointmentTime,
          totalPrice,
          status: 'agendado'
        }
      });
    } catch (err) {
      logger.error('Erro ao criar agendamento:', err);
      next(err);
    }
  }

  // Listar agendamentos
  async getAppointments(req, res, next) {
    try {
      const { page = 1, limit = 10, status, barberId, clientId, date } = req.query;
      const offset = (page - 1) * limit;
      const userType = req.user.user_type;
      const userId = req.user.id;

      let sql = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.total_price, a.notes,
          a.created_at, a.updated_at,
          c.name as client_name, c.email as client_email,
          b.name as barber_name, b.email as barber_email,
          s.name as service_name, s.duration as service_duration
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN users b ON a.barber_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE 1=1
      `;
      const params = [];

      // Filtros baseados no tipo de usuário
      if (userType === 'cliente') {
        sql += ' AND a.client_id = ?';
        params.push(userId);
      } else if (userType === 'barbeiro') {
        sql += ' AND a.barber_id = ?';
        params.push(userId);
      }

      // Filtros adicionais
      if (status) {
        sql += ' AND a.status = ?';
        params.push(status);
      }

      if (barberId && userType === 'admin') {
        sql += ' AND a.barber_id = ?';
        params.push(barberId);
      }

      if (clientId && userType === 'admin') {
        sql += ' AND a.client_id = ?';
        params.push(clientId);
      }

      if (date) {
        sql += ' AND a.appointment_date = ?';
        params.push(date);
      }

      sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(sql, params);

      // Contar total
      let countSql = 'SELECT COUNT(*) as total FROM appointments a WHERE 1=1';
      const countParams = [];

      if (userType === 'cliente') {
        countSql += ' AND a.client_id = ?';
        countParams.push(userId);
      } else if (userType === 'barbeiro') {
        countSql += ' AND a.barber_id = ?';
        countParams.push(userId);
      }

      if (status) {
        countSql += ' AND a.status = ?';
        countParams.push(status);
      }

      const [countResult] = await pool.query(countSql, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      logger.error('Erro ao listar agendamentos:', err);
      next(err);
    }
  }

  // Buscar agendamento por ID
  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;
      const userType = req.user.user_type;
      const userId = req.user.id;

      let sql = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.total_price, a.notes,
          a.created_at, a.updated_at,
          c.name as client_name, c.email as client_email, c.phone as client_phone,
          b.name as barber_name, b.email as barber_email, b.phone as barber_phone,
          s.name as service_name, s.description as service_description, s.duration as service_duration
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN users b ON a.barber_id = b.id
        JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `;
      const params = [id];

      // Verificar permissões
      if (userType === 'cliente') {
        sql += ' AND a.client_id = ?';
        params.push(userId);
      } else if (userType === 'barbeiro') {
        sql += ' AND a.barber_id = ?';
        params.push(userId);
      }

      const [rows] = await pool.query(sql, params);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (err) {
      logger.error('Erro ao buscar agendamento:', err);
      next(err);
    }
  }

  // Atualizar status do agendamento
  async updateAppointmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userType = req.user.user_type;
      const userId = req.user.id;

      const validStatuses = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      // Verificar se o agendamento existe e se o usuário tem permissão
      let checkSql = 'SELECT id, barber_id, status FROM appointments WHERE id = ?';
      const checkParams = [id];

      if (userType === 'barbeiro') {
        checkSql += ' AND barber_id = ?';
        checkParams.push(userId);
      }

      const [appointmentCheck] = await pool.query(checkSql, checkParams);

      if (appointmentCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Atualizar status
      await pool.query(
        'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      logger.info(`Status do agendamento ${id} atualizado para: ${status}`);

      res.json({
        success: true,
        message: 'Status atualizado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao atualizar status do agendamento:', err);
      next(err);
    }
  }

  // Cancelar agendamento
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const userType = req.user.user_type;
      const userId = req.user.id;

      // Verificar se o agendamento existe e se o usuário tem permissão
      let checkSql = 'SELECT id, client_id, barber_id, status, appointment_date FROM appointments WHERE id = ?';
      const checkParams = [id];

      if (userType === 'cliente') {
        checkSql += ' AND client_id = ?';
        checkParams.push(userId);
      } else if (userType === 'barbeiro') {
        checkSql += ' AND barber_id = ?';
        checkParams.push(userId);
      }

      const [appointmentCheck] = await pool.query(checkSql, checkParams);

      if (appointmentCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      const appointment = appointmentCheck[0];

      if (appointment.status === 'cancelado') {
        return res.status(400).json({
          success: false,
          message: 'Agendamento já foi cancelado'
        });
      }

      if (appointment.status === 'concluido') {
        return res.status(400).json({
          success: false,
          message: 'Não é possível cancelar um agendamento concluído'
        });
      }

      // Cancelar agendamento
      await pool.query(
        'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
        ['cancelado', id]
      );

      logger.info(`Agendamento ${id} cancelado pelo usuário ${userId}`);

      res.json({
        success: true,
        message: 'Agendamento cancelado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao cancelar agendamento:', err);
      next(err);
    }
  }

  // Obter disponibilidade do barbeiro
  async getBarberAvailability(req, res, next) {
    try {
      const { barberId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Data é obrigatória'
        });
      }

      // Verificar se o barbeiro existe
      const [barberCheck] = await pool.query(`
        SELECT u.id, u.name, b.working_hours, b.is_available 
        FROM users u 
        JOIN barbers b ON u.id = b.user_id 
        WHERE u.id = ? AND u.user_type = 'barbeiro' AND u.is_active = TRUE
      `, [barberId]);

      if (barberCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Barbeiro não encontrado'
        });
      }

      const barber = barberCheck[0];
      if (!barber.is_available) {
        return res.json({
          success: true,
          data: {
            barberId,
            date,
            availableSlots: []
          }
        });
      }

      // Buscar agendamentos existentes na data
      const [existingAppointments] = await pool.query(`
        SELECT appointment_time 
        FROM appointments 
        WHERE barber_id = ? AND appointment_date = ? AND status NOT IN ('cancelado')
      `, [barberId, date]);

      const bookedTimes = existingAppointments.map(apt => apt.appointment_time);

      // Gerar horários disponíveis baseado no horário de trabalho
      const workingHours = JSON.parse(barber.working_hours || '{}');
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      const availableSlots = [];
      
      if (workingHours[dayOfWeek] && !workingHours[dayOfWeek].closed) {
        const startTime = workingHours[dayOfWeek].start;
        const endTime = workingHours[dayOfWeek].end;
        
        // Gerar slots de 30 minutos
        let currentTime = startTime;
        while (currentTime < endTime) {
          if (!bookedTimes.includes(currentTime)) {
            availableSlots.push(currentTime);
          }
          
          // Adicionar 30 minutos
          const [hours, minutes] = currentTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + 30;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
        }
      }

      res.json({
        success: true,
        data: {
          barberId,
          barberName: barber.name,
          date,
          availableSlots
        }
      });
    } catch (err) {
      logger.error('Erro ao buscar disponibilidade:', err);
      next(err);
    }
  }
}

module.exports = new AppointmentController();
