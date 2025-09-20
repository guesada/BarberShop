const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateReview, validateUserId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Rotas públicas
router.get('/', validatePagination, asyncHandler(reviewController.getReviews));
router.get('/:id', validateUserId, asyncHandler(reviewController.getReviewById));
router.get('/barber/:barberId/stats', validateUserId, asyncHandler(reviewController.getBarberReviewStats));

// Rotas protegidas
router.use(authenticateToken);

// Criar avaliação (apenas clientes)
router.post('/', 
  authorize('cliente'), 
  validateReview, 
  asyncHandler(reviewController.createReview)
);

// Atualizar avaliação (próprio cliente ou admin)
router.put('/:id', 
  validateUserId, 
  validateReview, 
  asyncHandler(reviewController.updateReview)
);

// Deletar avaliação (próprio cliente ou admin)
router.delete('/:id', 
  validateUserId, 
  asyncHandler(reviewController.deleteReview)
);

module.exports = router;
