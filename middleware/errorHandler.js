const logger = require('../utils/logger');

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  // Erro de validação do Mongoose/MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Recurso duplicado';
    error = { message, statusCode: 409 };
  }

  // Erro de campo obrigatório
  if (err.code === 'ER_BAD_NULL_ERROR') {
    const message = 'Campo obrigatório não fornecido';
    error = { message, statusCode: 400 };
  }

  // Erro de sintaxe SQL
  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Erro interno do servidor';
    error = { message, statusCode: 500 };
  }

  // Erro de conexão com o banco
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    const message = 'Erro de conexão com o banco de dados';
    error = { message, statusCode: 503 };
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message, statusCode: 401 };
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de cast (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const message = `Rota não encontrada - ${req.method} ${req.originalUrl}`;
  logger.warn(message);
  
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
};

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
