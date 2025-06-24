module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/backend/tests/**/*.test.js',
    '<rootDir>/backend/tests/**/*-tests.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'backend/src/**/*.js',
    'database/**/*.js',
    'integrations/**/*.js',
    'n8n-workflows/functions/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Transform files - disable for CommonJS
  transform: {},
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@integrations/(.*)$': '<rootDir>/integrations/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1'
  },
  
  // Global setup and teardown
  globalSetup: '<rootDir>/backend/tests/global-setup.js',
  globalTeardown: '<rootDir>/backend/tests/global-teardown.js',
  
  // Error handling
  errorOnDeprecated: true,
  
  // Bail on first test failure in CI
  bail: process.env.CI ? 1 : 0,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true
};