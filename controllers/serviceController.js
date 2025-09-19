const pool = require('../config/db');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class ServiceController {
  // Criar serviço
  async createService(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { name, description, price, duration, category } = req.body;

      // Verificar se já existe um serviço com o mesmo nome
      const [existingService] = await pool.query(
        'SELECT id FROM services WHERE name = ?',
        [name]
      );

      if (existingService.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um serviço com este nome'
        });
      }

      // Criar serviço
      const sql = `
        INSERT INTO services (name, description, price, duration, category) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(sql, [name, description, price, duration, category]);

      logger.info(`Serviço criado: ${name} (ID: ${result.insertId})`);

      res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso',
        data: {
          id: result.insertId,
          name,
          description,
          price,
          duration,
          category
        }
      });
    } catch (err) {
      logger.error('Erro ao criar serviço:', err);
      next(err);
    }
  }

  // Listar serviços
  async getServices(req, res, next) {
    try {
      const { page = 1, limit = 10, category, active = 'true' } = req.query;
      const offset = (page - 1) * limit;

      let sql = 'SELECT id, name, description, price, duration, category, is_active, created_at, updated_at FROM services WHERE 1=1';
      const params = [];

      if (active === 'true') {
        sql += ' AND is_active = TRUE';
      }

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY category, name LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(sql, params);

      // Contar total
      let countSql = 'SELECT COUNT(*) as total FROM services WHERE 1=1';
      const countParams = [];

      if (active === 'true') {
        countSql += ' AND is_active = TRUE';
      }

      if (category) {
        countSql += ' AND category = ?';
        countParams.push(category);
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
      logger.error('Erro ao listar serviços:', err);
      next(err);
    }
  }

  // Buscar serviço por ID
  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        'SELECT id, name, description, price, duration, category, is_active, created_at, updated_at FROM services WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Serviço não encontrado'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (err) {
      logger.error('Erro ao buscar serviço:', err);
      next(err);
    }
  }

  // Atualizar serviço
  async updateService(req, res, next) {
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
      const { name, description, price, duration, category, isActive } = req.body;

      // Verificar se o serviço existe
      const [existingService] = await pool.query(
        'SELECT id FROM services WHERE id = ?',
        [id]
      );

      if (existingService.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Serviço não encontrado'
        });
      }

      // Verificar se já existe outro serviço com o mesmo nome
      const [nameCheck] = await pool.query(
        'SELECT id FROM services WHERE name = ? AND id != ?',
        [name, id]
      );

      if (nameCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um serviço com este nome'
        });
      }

      // Atualizar serviço
      const sql = `
        UPDATE services 
        SET name = ?, description = ?, price = ?, duration = ?, category = ?, is_active = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      await pool.query(sql, [name, description, price, duration, category, isActive !== false, id]);

      logger.info(`Serviço atualizado: ${name} (ID: ${id})`);

      res.json({
        success: true,
        message: 'Serviço atualizado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao atualizar serviço:', err);
      next(err);
    }
  }

  // Deletar serviço
  async deleteService(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se o serviço existe
      const [existingService] = await pool.query(
        'SELECT id, name FROM services WHERE id = ?',
        [id]
      );

      if (existingService.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Serviço não encontrado'
        });
      }

      // Verificar se existem agendamentos usando este serviço
      const [appointmentCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM appointments WHERE service_id = ? AND status NOT IN ("cancelado")',
        [id]
      );

      if (appointmentCheck[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível deletar um serviço que possui agendamentos ativos'
        });
      }

      // Deletar serviço (ou marcar como inativo)
      await pool.query('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);

      logger.info(`Serviço desativado: ${existingService[0].name} (ID: ${id})`);

      res.json({
        success: true,
        message: 'Serviço desativado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao deletar serviço:', err);
      next(err);
    }
  }

  // Obter categorias de serviços
  async getServiceCategories(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT DISTINCT category 
        FROM services 
        WHERE is_active = TRUE AND category IS NOT NULL 
        ORDER BY category
      `);

      const categories = rows.map(row => row.category);

      res.json({
        success: true,
        data: categories
      });
    } catch (err) {
      logger.error('Erro ao buscar categorias:', err);
      next(err);
    }
  }
}

module.exports = new ServiceController();
