const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateAppointment, validateUserId, validatePagination } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Criar agendamento (cliente)
router.post('/', 
  authorize('cliente'), 
  validateAppointment, 
  asyncHandler(appointmentController.createAppointment)
);

// Listar agendamentos
router.get('/', 
  validatePagination, 
  asyncHandler(appointmentController.getAppointments)
);

// Buscar agendamento por ID
router.get('/:id', 
  validateUserId, 
  asyncHandler(appointmentController.getAppointmentById)
);

// Atualizar status do agendamento (barbeiro/admin)
router.patch('/:id/status', 
  authorize('barbeiro', 'admin'), 
  validateUserId, 
  asyncHandler(appointmentController.updateAppointmentStatus)
);

// Cancelar agendamento
router.delete('/:id', 
  validateUserId, 
  asyncHandler(appointmentController.cancelAppointment)
);

// Listar horários disponíveis para um barbeiro
router.get('/barber/:barberId/availability', 
  validateUserId, 
  asyncHandler(appointmentController.getBarberAvailability)
);

module.exports = router;
