const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const logger = require('../utils/logger');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Verificar se o usuário ainda existe no banco
      const [users] = await pool.query(
        'SELECT id, name, email, user_type FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      req.user = users[0];
      next();
    });
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware de autorização por tipo de usuário
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.'
      });
    }

    next();
  };
};

// Middleware para verificar se o usuário pode acessar seus próprios dados
const authorizeOwnerOrAdmin = (req, res, next) => {
  const requestedUserId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const userType = req.user.user_type;

  if (userType === 'admin' || currentUserId === requestedUserId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin
};
