// Jest setup file for test environment configuration
const path = require('path');

// Load environment variables for testing
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.test')
});

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: process.env.VERBOSE_TESTS ? console.log : jest.fn(),
  debug: process.env.VERBOSE_TESTS ? console.debug : jest.fn(),
  info: process.env.VERBOSE_TESTS ? console.info : jest.fn(),
  warn: console.warn,
  error: console.error
};

// Mock external services by default
jest.mock('airtable', () => {
  const mockBase = {
    table: jest.fn().mockReturnThis(),
    create: jest.fn(),
    select: jest.fn().mockReturnThis(),
    firstPage: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    find: jest.fn()
  };
  
  return jest.fn().mockImplementation(() => ({
    base: jest.fn(() => mockBase)
  }));
});

jest.mock('googleapis', () => {
  const mockSheets = {
    spreadsheets: {
      values: {
        update: jest.fn(),
        get: jest.fn(),
        batchUpdate: jest.fn(),
        append: jest.fn()
      },
      get: jest.fn(),
      batchUpdate: jest.fn()
    }
  };
  
  return {
    google: {
      sheets: jest.fn(() => mockSheets),
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({})
        }))
      }
    }
  };
});

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock OpenAI response'
            }
          }]
        })
      }
    }
  }));
});

jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'mock-message-sid',
        status: 'sent'
      })
    }
  }));
});

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id'
    })
  })
}));

// Global test utilities
global.testUtils = {
  // Generate mock user data
  createMockUser: (overrides = {}) => {
    const timestamp = new Date().toISOString();
    const randomId = Math.random().toString(36).substr(2, 9);
    const randomEmail = `test-${randomId}@example.com`;
    
    return {
      user_id: `test-user-${randomId}`,
      name: 'Test User',
      email: randomEmail,
      whatsapp: '+1234567890',
      job_title: 'Developer',
      skill_gaps: ['JavaScript', 'React'],
      learning_goals: ['Master frontend development'],
      preferred_format: 'video',
      availability: 'morning',
      timezone: 'UTC-5',
      language: 'English',
      experience_level: 'intermediate',
      industry: 'Technology',
      department: 'Engineering',
      created_at: timestamp,
      updated_at: timestamp,
      ...overrides
    };
  },
  
  // Generate mock lesson data
  createMockLesson: (overrides = {}) => ({
    lesson_id: 'test-lesson-456',
    title: 'Test Lesson',
    description: 'A test lesson for unit testing',
    content: 'This is test content for the lesson.',
    content_type: 'article',
    duration: 5,
    difficulty_level: 'beginner',
    tags: ['test', 'javascript'],
    prerequisites: [],
    learning_objectives: ['Understand testing', 'Learn Jest'],
    category: 'Programming',
    subcategory: 'Testing',
    language: 'English',
    author_id: 'author-123',
    status: 'published',
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Generate mock analytics data
  createMockAnalytics: (overrides = {}) => ({
    analytics_id: 'analytics-789',
    user_id: 'test-user-123',
    date: new Date().toISOString().split('T')[0],
    lessons_delivered: 5,
    lessons_completed: 3,
    total_engagement_time: 15,
    average_engagement_score: 8.5,
    completion_rate: 0.6,
    preferred_content_type: 'video',
    peak_engagement_time: '09:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Generate mock engagement data
  createMockEngagement: (overrides = {}) => ({
    engagement_id: 'engagement-101',
    user_id: 'test-user-123',
    lesson_id: 'test-lesson-456',
    interaction_type: 'view',
    timestamp: new Date().toISOString(),
    duration: 300,
    device_type: 'desktop',
    location: 'US',
    session_id: 'session-abc123',
    user_agent: 'Mozilla/5.0 (Test Browser)',
    referrer: 'https://example.com',
    engagement_score: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' }
  })
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AIRTABLE_API_KEY = 'test-airtable-key';
process.env.AIRTABLE_BASE_ID = 'appXXXXXXXXXXXXXX';
process.env.GOOGLE_SHEETS_ID = '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.TWILIO_ACCOUNT_SID = 'test-twilio-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Jest setup completed - Test environment configured');