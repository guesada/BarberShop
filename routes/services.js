const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateService, validateUserId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Rotas públicas
router.get('/', validatePagination, asyncHandler(serviceController.getServices));
router.get('/categories', asyncHandler(serviceController.getServiceCategories));
router.get('/:id', validateUserId, asyncHandler(serviceController.getServiceById));

// Rotas protegidas (apenas admin)
router.use(authenticateToken);
router.use(authorize('admin'));

router.post('/', validateService, asyncHandler(serviceController.createService));
router.put('/:id', validateUserId, validateService, asyncHandler(serviceController.updateService));
router.delete('/:id', validateUserId, asyncHandler(serviceController.deleteService));

module.exports = router;
