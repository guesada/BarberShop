const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class UserController {
  // Criar usuário
  async createUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { name, email, password, userType = 'cliente' } = req.body;

      // Verificar se o usuário já existe
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já cadastrado'
        });
      }

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserir usuário
      const sql = `
        INSERT INTO users (name, email, password, user_type, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [result] = await pool.query(sql, [name, email, hashedPassword, userType]);

      logger.info(`Novo usuário criado: ${email} (ID: ${result.insertId})`);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          id: result.insertId,
          name,
          email,
          userType
        }
      });
    } catch (err) {
      logger.error('Erro ao criar usuário:', err);
      next(err);
    }
  }

  // Listar usuários
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, userType } = req.query;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT id, name, email, user_type, created_at, updated_at 
        FROM users 
      `;
      const params = [];

      if (userType) {
        sql += ' WHERE user_type = ?';
        params.push(userType);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.query(sql, params);

      // Contar total de registros
      let countSql = 'SELECT COUNT(*) as total FROM users';
      const countParams = [];

      if (userType) {
        countSql += ' WHERE user_type = ?';
        countParams.push(userType);
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
      logger.error('Erro ao listar usuários:', err);
      next(err);
    }
  }

  // Buscar usuário por ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        'SELECT id, name, email, user_type, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (err) {
      logger.error('Erro ao buscar usuário:', err);
      next(err);
    }
  }

  // Atualizar usuário
  async updateUser(req, res, next) {
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
      const { name, email } = req.body;

      // Verificar se o usuário existe
      const [existingUser] = await pool.query(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se o e-mail já está em uso por outro usuário
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já está em uso'
        });
      }

      // Atualizar usuário
      const sql = `
        UPDATE users 
        SET name = ?, email = ?, updated_at = NOW() 
        WHERE id = ?
      `;
      await pool.query(sql, [name, email, id]);

      logger.info(`Usuário atualizado: ${email} (ID: ${id})`);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao atualizar usuário:', err);
      next(err);
    }
  }

  // Deletar usuário
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se o usuário existe
      const [existingUser] = await pool.query(
        'SELECT id, email FROM users WHERE id = ?',
        [id]
      );

      if (existingUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Deletar usuário
      await pool.query('DELETE FROM users WHERE id = ?', [id]);

      logger.info(`Usuário deletado: ${existingUser[0].email} (ID: ${id})`);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (err) {
      logger.error('Erro ao deletar usuário:', err);
      next(err);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuário
      const [users] = await pool.query(
        'SELECT id, name, email, password, user_type FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const user = users[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          userType: user.user_type 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info(`Login realizado: ${email}`);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.user_type
          },
          token
        }
      });
    } catch (err) {
      logger.error('Erro no login:', err);
      next(err);
    }
  }
}

module.exports = new UserController();
