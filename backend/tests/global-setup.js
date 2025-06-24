// Global setup for Jest - runs once before all tests
const path = require('path');
const fs = require('fs');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  // Ensure test environment variables are loaded
  const envTestPath = path.resolve(__dirname, '../../.env.test');
  
  // Create .env.test if it doesn't exist
  if (!fs.existsSync(envTestPath)) {
    const testEnvContent = `# Test Environment Variables
NODE_ENV=test
AIRTABLE_API_KEY=test-airtable-key
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
GOOGLE_SHEETS_ID=1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
OPENAI_API_KEY=test-openai-key
TWILIO_ACCOUNT_SID=test-twilio-sid
TWILIO_AUTH_TOKEN=test-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
SMTP_HOST=smtp.test.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASS=test-password
JWT_SECRET=test-jwt-secret
API_BASE_URL=http://localhost:3000
LOG_LEVEL=error
TEST_TIMEOUT=10000
VERBOSE_TESTS=false
`;
    
    fs.writeFileSync(envTestPath, testEnvContent);
    console.log('📝 Created .env.test file');
  }
  
  // Load test environment variables
  require('dotenv').config({ path: envTestPath });
  
  // Set global test configuration
  global.__TEST_START_TIME__ = Date.now();
  global.__TEST_ENV__ = 'test';
  
  // Create test directories if they don't exist
  const testDirs = [
    path.resolve(__dirname, '../temp'),
    path.resolve(__dirname, '../logs'),
    path.resolve(__dirname, '../fixtures/temp')
  ];
  
  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created test directory: ${dir}`);
    }
  });
  
  // Initialize test database connections (mock)
  global.__TEST_DB__ = {
    airtable: {
      connected: false,
      tables: ['Users', 'Lessons', 'Analytics', 'Engagement']
    },
    googleSheets: {
      connected: false,
      sheets: ['Users', 'Lessons', 'Analytics', 'Engagement', 'Performance']
    }
  };
  
  // Set up test data cleanup registry
  global.__TEST_CLEANUP__ = {
    files: [],
    records: [],
    connections: []
  };
  
  // Mock external service responses
  global.__MOCK_RESPONSES__ = {
    airtable: {
      create: { id: 'rec123', fields: {} },
      select: { records: [] },
      update: { id: 'rec123', fields: {} },
      delete: { deleted: true, id: 'rec123' }
    },
    googleSheets: {
      values: {
        update: { updatedCells: 1 },
        get: { values: [] },
        append: { updates: { updatedCells: 1 } }
      }
    },
    openai: {
      completion: {
        choices: [{ message: { content: 'Test AI response' } }]
      }
    },
    twilio: {
      message: {
        sid: 'SM123',
        status: 'sent',
        to: '+1234567890'
      }
    },
    email: {
      messageId: 'test-message-id',
      response: '250 Message queued'
    }
  };
  
  // Performance monitoring for tests
  global.__PERFORMANCE__ = {
    startTime: Date.now(),
    testTimes: {},
    slowTests: []
  };
  
  console.log('✅ Global test setup completed');
  console.log(`📊 Test environment: ${process.env.NODE_ENV}`);
  console.log(`🔧 Mock services initialized`);
  console.log(`⏱️  Setup time: ${Date.now() - global.__TEST_START_TIME__}ms`);
};