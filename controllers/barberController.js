const pool = require('../config/db');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class BarberController {
  // Criar perfil de barbeiro
  async createBarberProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { specialties, bio, experienceYears, basePrice, workingHours } = req.body;

      // Verificar se o usuário é barbeiro
      const [userCheck] = await pool.query(
        'SELECT id, user_type FROM users WHERE id = ? AND user_type = "barbeiro"',
        [userId]
      );

      if (userCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Apenas usuários do tipo barbeiro podem criar perfil'
        });
      }

      // Verificar se já existe perfil
      const [existingProfile] = await pool.query(
        'SELECT id FROM barbers WHERE user_id = ?',
        [userId]
      );

      if (existingProfile.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Perfil de barbeiro já existe'
        });
      }

      // Criar perfil de barbeiro
      const sql = `
        INSERT INTO barbers (user_id, specialties, bio, experience_years, base_price, working_hours) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [
        userId,
        JSON.stringify(specialties),
        bio,
        experienceYears,
        basePrice,
        JSON.stringify(workingHours)
      ]);

      logger.info(`Perfil de barbeiro criado para usuário ID: ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Perfil de barbeiro criado com sucesso',
        data: {
          id: result.insertId,
          userId,
          specialties,
          bio,
          experienceYears,
          basePrice,
          workingHours
        }
      });
    } catch (err) {
      logger.error('Erro ao criar perfil de barbeiro:', err);
      next(err);
    }
  }

  // Listar barbeiros
  async getBarbers(req, res, next) {
    try {
      const { page = 1, limit = 10, available = 'true', specialty } = req.query;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          b.id, b.user_id, b.specialties, b.bio, b.experience_years, 
          b.rating, b.total_reviews, b.base_price, b.is_available, b.working_hours,
          u.name, u.email, u.avatar_url, u.created_at
        FROM barbers b
        JOIN users u ON b.user_id = u.id
        WHERE u.is_active = TRUE
      `;
      const params = [];

      if (available === 'true') {
        sql += ' AND b.is_available = TRUE';
      }

      if (specialty) {
        sql += ' AND JSON_CONTAINS(b.specialties, ?)';
        params.push(`"${specialty}"`);
      }

      sql += ' ORDER BY b.rating DESC, b.total_reviews DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(sql, params);

      // Parse JSON fields safely
      const barbers = rows.map(barber => {
        let specialties = [];
        let working_hours = {};

        try {
          if (barber.specialties) {
            if (typeof barber.specialties === 'string') {
              // Se for string, tentar fazer parse
              specialties = JSON.parse(barber.specialties);
            } else if (Array.isArray(barber.specialties)) {
              // Se já for array, usar diretamente
              specialties = barber.specialties;
            }
          }
        } catch (e) {
          logger.error('Erro ao fazer parse de specialties:', e, 'Data:', barber.specialties);
          specialties = [];
        }

        try {
          if (barber.working_hours) {
            if (typeof barber.working_hours === 'string') {
              working_hours = JSON.parse(barber.working_hours);
            } else if (typeof barber.working_hours === 'object') {
              working_hours = barber.working_hours;
            }
          }
        } catch (e) {
          logger.error('Erro ao fazer parse de working_hours:', e, 'Data:', barber.working_hours);
          working_hours = {};
        }

        return {
          ...barber,
          specialties,
          working_hours
        };
      });

      // Contar total
      let countSql = `
        SELECT COUNT(*) as total 
        FROM barbers b
        JOIN users u ON b.user_id = u.id
        WHERE u.is_active = TRUE
      `;
      const countParams = [];

      if (available === 'true') {
        countSql += ' AND b.is_available = TRUE';
      }

      if (specialty) {
        countSql += ' AND JSON_CONTAINS(b.specialties, ?)';
        countParams.push(`"${specialty}"`);
      }

      const [countResult] = await pool.query(countSql, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: barbers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      logger.error('Erro ao listar barbeiros:', err);
      next(err);
    }
  }

  // Buscar barbeiro por ID
  async getBarberById(req, res, next) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(`
        SELECT 
          b.id, b.user_id, b.specialties, b.bio, b.experience_years, 
          b.rating, b.total_reviews, b.base_price, b.is_available, b.working_hours,
          u.name, u.email, u.avatar_url, u.created_at
        FROM barbers b
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ? AND u.is_active = TRUE
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Barbeiro não encontrado'
        });
      }

      let specialties = [];
      let working_hours = {};

      try {
        if (rows[0].specialties) {
          if (typeof rows[0].specialties === 'string') {
            specialties = JSON.parse(rows[0].specialties);
          } else if (Array.isArray(rows[0].specialties)) {
            specialties = rows[0].specialties;
          }
        }
      } catch (e) {
        logger.error('Erro ao fazer parse de specialties:', e, 'Data:', rows[0].specialties);
        specialties = [];
      }

      try {
        if (rows[0].working_hours) {
          if (typeof rows[0].working_hours === 'string') {
            working_hours = JSON.parse(rows[0].working_hours);
          } else if (typeof rows[0].working_hours === 'object') {
            working_hours = rows[0].working_hours;
          }
        }
      } catch (e) {
        logger.error('Erro ao fazer parse de working_hours:', e, 'Data:', rows[0].working_hours);
        working_hours = {};
      }

      const barber = {
        ...rows[0],
        specialties,
        working_hours
      };

      res.json({
        success: true,
        data: barber
      });
    } catch (err) {
      logger.error('Erro ao buscar barbeiro:', err);
      next(err);
    }
  }

  // Atualizar perfil de barbeiro
  async updateBarberProfile(req, res, next) {
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
      const userId = req.user.id;
      const { specialties, bio, experienceYears, basePrice, workingHours, isAvailable } = req.body;

      // Verificar se o barbeiro existe e pertence ao usuário (ou é admin)
      const [barberCheck] = await pool.query(
        'SELECT user_id FROM barbers WHERE id = ?',
        [id]
      );

      if (barberCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de barbeiro não encontrado'
        });
      }

      if (req.user.user_type !== 'admin' && barberCheck[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode atualizar seu próprio perfil'
        });
      }

      // Atualizar perfil
      const sql = `
        UPDATE barbers 
        SET specialties = ?, bio = ?, experience_years = ?, base_price = ?, 
            working_hours = ?, is_available = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await pool.query(sql, [
        JSON.stringify(specialties),
        bio,
        experienceYears,
        basePrice,
        JSON.stringify(workingHours),
        isAvailable !== false,
        id
      ]);

      logger.info(`Perfil de barbeiro atualizado: ID ${id}`);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao atualizar perfil de barbeiro:', err);
      next(err);
    }
  }

  // Obter estatísticas do barbeiro
  async getBarberStats(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar se o barbeiro existe e pertence ao usuário (ou é admin)
      const [barberCheck] = await pool.query(
        'SELECT user_id FROM barbers WHERE id = ?',
        [id]
      );

      if (barberCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Barbeiro não encontrado'
        });
      }

      if (req.user.user_type !== 'admin' && barberCheck[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Buscar estatísticas
      const [stats] = await pool.query(`
        SELECT 
          COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as total_appointments,
          COUNT(CASE WHEN a.status = 'agendado' THEN 1 END) as pending_appointments,
          COUNT(CASE WHEN a.status = 'cancelado' THEN 1 END) as cancelled_appointments,
          AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END) as avg_rating,
          COUNT(r.id) as total_reviews,
          SUM(CASE WHEN a.status = 'concluido' THEN a.total_price ELSE 0 END) as total_revenue
        FROM barbers b
        LEFT JOIN appointments a ON b.user_id = a.barber_id
        LEFT JOIN reviews r ON a.id = r.appointment_id
        WHERE b.id = ?
        GROUP BY b.id
      `, [id]);

      const statistics = stats[0] || {
        total_appointments: 0,
        pending_appointments: 0,
        cancelled_appointments: 0,
        avg_rating: 0,
        total_reviews: 0,
        total_revenue: 0
      };

      res.json({
        success: true,
        data: {
          ...statistics,
          avg_rating: parseFloat(statistics.avg_rating || 0).toFixed(2),
          total_revenue: parseFloat(statistics.total_revenue || 0).toFixed(2)
        }
      });
    } catch (err) {
      logger.error('Erro ao buscar estatísticas do barbeiro:', err);
      next(err);
    }
  }

  // Obter especialidades disponíveis
  async getSpecialties(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT DISTINCT JSON_UNQUOTE(JSON_EXTRACT(specialties, CONCAT('$[', idx, ']'))) as specialty
        FROM barbers b
        JOIN (
          SELECT 0 as idx UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
        ) numbers
        WHERE JSON_LENGTH(specialties) > idx
        AND JSON_UNQUOTE(JSON_EXTRACT(specialties, CONCAT('$[', idx, ']'))) IS NOT NULL
        ORDER BY specialty
      `);

      const specialties = rows
        .map(row => row.specialty)
        .filter(specialty => specialty && specialty !== 'null');

      res.json({
        success: true,
        data: [...new Set(specialties)] // Remove duplicates
      });
    } catch (err) {
      logger.error('Erro ao buscar especialidades:', err);
      next(err);
    }
  }
}

module.exports = new BarberController();
