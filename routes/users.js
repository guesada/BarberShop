const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { 
  validateUserCreation, 
  validateUserUpdate, 
  validateLogin, 
  validateUserId, 
  validatePagination 
} = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Rotas públicas
router.post('/register', validateUserCreation, asyncHandler(userController.createUser));
router.post('/login', validateLogin, asyncHandler(userController.login));

// Rotas protegidas
router.use(authenticateToken); // Todas as rotas abaixo requerem autenticação

// Listar usuários (apenas admin)
router.get('/', 
  authorize('admin'), 
  validatePagination, 
  asyncHandler(userController.getUsers)
);

// Buscar usuário por ID (próprio usuário ou admin)
router.get('/:id', 
  validateUserId, 
  authorizeOwnerOrAdmin, 
  asyncHandler(userController.getUserById)
);

// Atualizar usuário (próprio usuário ou admin)
router.put('/:id', 
  validateUserId, 
  validateUserUpdate, 
  authorizeOwnerOrAdmin, 
  asyncHandler(userController.updateUser)
);

// Deletar usuário (apenas admin)
router.delete('/:id', 
  authorize('admin'), 
  validateUserId, 
  asyncHandler(userController.deleteUser)
);

module.exports = router;
