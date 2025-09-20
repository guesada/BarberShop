const { body, param, query } = require('express-validator');

// Validações para usuário
const validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('E-mail muito longo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  body('userType')
    .optional()
    .isIn(['cliente', 'barbeiro', 'admin'])
    .withMessage('Tipo de usuário deve ser: cliente, barbeiro ou admin')
];

const validateUserUpdate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('E-mail muito longo')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para parâmetros
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número inteiro positivo')
];

// Validações para query parameters
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('userType')
    .optional()
    .isIn(['cliente', 'barbeiro', 'admin'])
    .withMessage('Tipo de usuário deve ser: cliente, barbeiro ou admin')
];

// Validações para agendamento
const validateAppointment = [
  body('barberId')
    .isInt({ min: 1 })
    .withMessage('ID do barbeiro deve ser um número inteiro positivo'),
  
  body('serviceId')
    .isInt({ min: 1 })
    .withMessage('ID do serviço deve ser um número inteiro positivo'),
  
  body('appointmentDate')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      
      if (appointmentDate <= now) {
        throw new Error('Data do agendamento deve ser no futuro');
      }
      
      // Verificar se é um dia útil (segunda a sábado)
      const dayOfWeek = appointmentDate.getDay();
      if (dayOfWeek === 0) { // Domingo
        throw new Error('Agendamentos não são permitidos aos domingos');
      }
      
      return true;
    }),
  
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Horário deve estar no formato HH:MM')
    .custom((value) => {
      const [hours, minutes] = value.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      
      // Horário de funcionamento: 8:00 às 18:00
      if (totalMinutes < 8 * 60 || totalMinutes > 18 * 60) {
        throw new Error('Horário deve estar entre 08:00 e 18:00');
      }
      
      // Verificar se é um horário válido (intervalos de 30 minutos)
      if (minutes !== 0 && minutes !== 30) {
        throw new Error('Agendamentos são permitidos apenas em intervalos de 30 minutos');
      }
      
      return true;
    }),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações não podem exceder 500 caracteres')
];

// Validações para serviços
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do serviço deve ter entre 2 e 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode exceder 500 caracteres'),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Preço deve ser um valor positivo'),
  
  body('duration')
    .isInt({ min: 15, max: 240 })
    .withMessage('Duração deve ser entre 15 e 240 minutos'),
  
  body('category')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres')
];

// Validações para perfil de barbeiro
const validateBarberProfile = [
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('Especialidades devem ser um array com pelo menos um item'),
  
  body('specialties.*')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cada especialidade deve ter entre 2 e 50 caracteres'),
  
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio não pode exceder 1000 caracteres'),
  
  body('experienceYears')
    .isInt({ min: 0, max: 50 })
    .withMessage('Anos de experiência deve ser entre 0 e 50'),
  
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Preço base deve ser um valor positivo'),
  
  body('workingHours')
    .isObject()
    .withMessage('Horários de trabalho devem ser um objeto'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('Disponibilidade deve ser um valor booleano')
];

// Validações para avaliações
const validateReview = [
  body('appointmentId')
    .isInt({ min: 1 })
    .withMessage('ID do agendamento deve ser um número inteiro positivo'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser entre 1 e 5 estrelas'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comentário não pode exceder 1000 caracteres')
];

module.exports = {
  validateUserCreation,
  validateUserUpdate,
  validateLogin,
  validateUserId,
  validatePagination,
  validateAppointment,
  validateService,
  validateBarberProfile,
  validateReview
};
