module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',

  // Padrão para encontrar arquivos de teste
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],

  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/logs/'
  ],

  // Configuração de coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Timeout para testes
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Limpar mocks automaticamente
  clearMocks: true,

  // Restaurar mocks automaticamente
  restoreMocks: true
};
