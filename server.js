require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar utilitários e middlewares
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importar rotas
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');
const barberRoutes = require('./routes/barbers');
const reviewRoutes = require('./routes/reviews');

// Testar conexão com banco
const pool = require('./config/db');

const app = express();

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Compressão
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limite de requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Rate limiting mais restritivo para login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true
});

app.use('/api/users/login', authLimiter);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições
app.use(logger.logRequest);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Testar conexão com banco na inicialização (opcional)
(async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('Conectado ao MySQL com sucesso!');
    connection.release();
  } catch (err) {
    logger.warn('Aviso: Não foi possível conectar ao banco de dados:', err.message);
    logger.info('O servidor continuará rodando. Configure o MySQL e reinicie.');
  }
})();

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Elite Barber API está funcionando!',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota raiz - servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página de teste de notificações
app.get('/test-notifications', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-notifications.html'));
});

// Rota de teste simples (sem autenticação)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando sem autenticação',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', require('./routes/notifications'));

// Rota para obter informações da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Elite Barber API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      appointments: '/api/appointments',
      services: '/api/services',
      barbers: '/api/barbers',
      reviews: '/api/reviews',
      notifications: '/api/notifications'
    },
    documentation: '/api/docs'
  });
});

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Tratamento de erros não capturados
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  
  try {
    await pool.end();
    logger.info('Conexões com banco encerradas.');
    process.exit(0);
  } catch (err) {
    logger.error('Erro ao encerrar conexões:', err);
    process.exit(1);
  }
});

// Inicializar serviços
async function initializeServices() {
  try {
    // Verificar se as configurações de email estão presentes
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Testar conexão com email
      const emailService = require('./services/emailService');
      await emailService.testConnection();
      
      // Iniciar scheduler de notificações
      const schedulerService = require('./services/schedulerService');
      schedulerService.start();
      
      logger.info('✅ Todos os serviços inicializados com sucesso');
    } else {
      logger.warn('⚠️ Configurações de email não encontradas. Sistema funcionará sem notificações.');
    }
  } catch (error) {
    logger.warn('⚠️ Alguns serviços podem não estar funcionando:', error.message);
    logger.info('💡 O sistema continuará funcionando sem notificações por email.');
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Servidor Elite Barber rodando na porta ${PORT}`);
  logger.info(`📱 Frontend: http://localhost:${PORT}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
  logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar serviços após o servidor estar rodando
  await initializeServices();
});

// Timeout para requests
server.timeout = 30000; // 30 segundos

module.exports = app;
