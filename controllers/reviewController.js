const pool = require('../config/db');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class ReviewController {
  // Criar avaliação
  async createReview(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { appointmentId, rating, comment } = req.body;
      const clientId = req.user.id;

      // Verificar se o agendamento existe e pertence ao cliente
      const [appointmentCheck] = await pool.query(`
        SELECT id, client_id, barber_id, status 
        FROM appointments 
        WHERE id = ? AND client_id = ?
      `, [appointmentId, clientId]);

      if (appointmentCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado ou não pertence a você'
        });
      }

      const appointment = appointmentCheck[0];

      // Verificar se o agendamento foi concluído
      if (appointment.status !== 'concluido') {
        return res.status(400).json({
          success: false,
          message: 'Só é possível avaliar agendamentos concluídos'
        });
      }

      // Verificar se já existe avaliação para este agendamento
      const [existingReview] = await pool.query(
        'SELECT id FROM reviews WHERE appointment_id = ?',
        [appointmentId]
      );

      if (existingReview.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Este agendamento já foi avaliado'
        });
      }

      // Criar avaliação
      const sql = `
        INSERT INTO reviews (appointment_id, client_id, barber_id, rating, comment) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [
        appointmentId,
        clientId,
        appointment.barber_id,
        rating,
        comment
      ]);

      // Atualizar rating do barbeiro
      await this.updateBarberRating(appointment.barber_id);

      logger.info(`Avaliação criada: ID ${result.insertId} para agendamento ${appointmentId}`);

      res.status(201).json({
        success: true,
        message: 'Avaliação criada com sucesso',
        data: {
          id: result.insertId,
          appointmentId,
          rating,
          comment
        }
      });
    } catch (err) {
      logger.error('Erro ao criar avaliação:', err);
      next(err);
    }
  }

  // Listar avaliações
  async getReviews(req, res, next) {
    try {
      const { page = 1, limit = 10, barberId, rating } = req.query;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          r.id, r.appointment_id, r.rating, r.comment, r.created_at,
          u_client.name as client_name,
          u_barber.name as barber_name,
          s.name as service_name
        FROM reviews r
        JOIN users u_client ON r.client_id = u_client.id
        JOIN users u_barber ON r.barber_id = u_barber.id
        JOIN appointments a ON r.appointment_id = a.id
        JOIN services s ON a.service_id = s.id
        WHERE 1=1
      `;
      const params = [];

      if (barberId) {
        sql += ' AND r.barber_id = ?';
        params.push(barberId);
      }

      if (rating) {
        sql += ' AND r.rating = ?';
        params.push(rating);
      }

      sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(sql, params);

      // Contar total
      let countSql = 'SELECT COUNT(*) as total FROM reviews r WHERE 1=1';
      const countParams = [];

      if (barberId) {
        countSql += ' AND r.barber_id = ?';
        countParams.push(barberId);
      }

      if (rating) {
        countSql += ' AND r.rating = ?';
        countParams.push(rating);
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
      logger.error('Erro ao listar avaliações:', err);
      next(err);
    }
  }

  // Buscar avaliação por ID
  async getReviewById(req, res, next) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(`
        SELECT 
          r.id, r.appointment_id, r.rating, r.comment, r.created_at,
          u_client.name as client_name,
          u_barber.name as barber_name,
          s.name as service_name
        FROM reviews r
        JOIN users u_client ON r.client_id = u_client.id
        JOIN users u_barber ON r.barber_id = u_barber.id
        JOIN appointments a ON r.appointment_id = a.id
        JOIN services s ON a.service_id = s.id
        WHERE r.id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (err) {
      logger.error('Erro ao buscar avaliação:', err);
      next(err);
    }
  }

  // Atualizar avaliação
  async updateReview(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;
      const clientId = req.user.id;

      // Verificar se a avaliação existe e pertence ao cliente
      const [reviewCheck] = await pool.query(
        'SELECT client_id, barber_id FROM reviews WHERE id = ?',
        [id]
      );

      if (reviewCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      if (req.user.user_type !== 'admin' && reviewCheck[0].client_id !== clientId) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode atualizar suas próprias avaliações'
        });
      }

      // Atualizar avaliação
      const sql = `
        UPDATE reviews 
        SET rating = ?, comment = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      await pool.query(sql, [rating, comment, id]);

      // Atualizar rating do barbeiro
      await this.updateBarberRating(reviewCheck[0].barber_id);

      logger.info(`Avaliação atualizada: ID ${id}`);

      res.json({
        success: true,
        message: 'Avaliação atualizada com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao atualizar avaliação:', err);
      next(err);
    }
  }

  // Deletar avaliação
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const clientId = req.user.id;

      // Verificar se a avaliação existe e pertence ao cliente
      const [reviewCheck] = await pool.query(
        'SELECT client_id, barber_id FROM reviews WHERE id = ?',
        [id]
      );

      if (reviewCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
      }

      if (req.user.user_type !== 'admin' && reviewCheck[0].client_id !== clientId) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode deletar suas próprias avaliações'
        });
      }

      // Deletar avaliação
      await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

      // Atualizar rating do barbeiro
      await this.updateBarberRating(reviewCheck[0].barber_id);

      logger.info(`Avaliação deletada: ID ${id}`);

      res.json({
        success: true,
        message: 'Avaliação deletada com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao deletar avaliação:', err);
      next(err);
    }
  }

  // Obter estatísticas de avaliações de um barbeiro
  async getBarberReviewStats(req, res, next) {
    try {
      const { barberId } = req.params;

      const [stats] = await pool.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM reviews 
        WHERE barber_id = ?
      `, [barberId]);

      const statistics = stats[0] || {
        total_reviews: 0,
        average_rating: 0,
        five_stars: 0,
        four_stars: 0,
        three_stars: 0,
        two_stars: 0,
        one_star: 0
      };

      res.json({
        success: true,
        data: {
          ...statistics,
          average_rating: parseFloat(statistics.average_rating || 0).toFixed(2)
        }
      });
    } catch (err) {
      logger.error('Erro ao buscar estatísticas de avaliações:', err);
      next(err);
    }
  }

  // Método auxiliar para atualizar rating do barbeiro
  async updateBarberRating(barberId) {
    try {
      const [stats] = await pool.query(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
        FROM reviews 
        WHERE barber_id = ?
      `, [barberId]);

      const avgRating = stats[0].avg_rating || 0;
      const totalReviews = stats[0].total_reviews || 0;

      await pool.query(`
        UPDATE barbers 
        SET rating = ?, total_reviews = ?, updated_at = NOW()
        WHERE user_id = ?
      `, [avgRating, totalReviews, barberId]);

      logger.info(`Rating do barbeiro ${barberId} atualizado: ${avgRating} (${totalReviews} avaliações)`);
    } catch (err) {
      logger.error('Erro ao atualizar rating do barbeiro:', err);
      throw err;
    }
  }
}

module.exports = new ReviewController();
