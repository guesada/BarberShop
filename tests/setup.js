// Setup global para testes
require('dotenv').config({ path: '.env.test' });

// Mock do logger para testes
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  logRequest: jest.fn((req, res, next) => next())
}));

// Configurações globais para testes
global.console = {
  ...console,
  // Silenciar logs durante os testes
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Timeout global para operações assíncronas
jest.setTimeout(10000);

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Setup e teardown do banco de dados para testes
beforeAll(async () => {
  // Configurar banco de dados de teste se necessário
});

afterAll(async () => {
  // Limpar banco de dados de teste se necessário
});
