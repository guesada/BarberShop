const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const { authenticateToken, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { validateBarberProfile, validateUserId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Rotas públicas
router.get('/', validatePagination, asyncHandler(barberController.getBarbers));
router.get('/specialties', asyncHandler(barberController.getSpecialties));
router.get('/:id', validateUserId, asyncHandler(barberController.getBarberById));

// Rotas protegidas
router.use(authenticateToken);

// Criar perfil de barbeiro (apenas barbeiros)
router.post('/', 
  authorize('barbeiro'), 
  validateBarberProfile, 
  asyncHandler(barberController.createBarberProfile)
);

// Atualizar perfil de barbeiro (próprio barbeiro ou admin)
router.put('/:id', 
  validateUserId, 
  validateBarberProfile, 
  asyncHandler(barberController.updateBarberProfile)
);

// Obter estatísticas do barbeiro (próprio barbeiro ou admin)
router.get('/:id/stats', 
  validateUserId, 
  asyncHandler(barberController.getBarberStats)
);

module.exports = router;
