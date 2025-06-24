// Airtable Setup

/**
 * Airtable Setup Script
 * Creates and configures Airtable tables for the micro-learning scheduler
 */

const Airtable = require('airtable');
const { BASE_CONFIG, validateConfig } = require('../config/base-config');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV !== 'test' ? [new winston.transports.File({ filename: './monitoring/logs/airtable-setup.log' })] : [])
  ]
});

/**
 * Initialize Airtable connection
 */
function initializeAirtable() {
  try {
    validateConfig();

    const base = new Airtable({
      apiKey: BASE_CONFIG.apiKey
    }).base(BASE_CONFIG.baseId);

    logger.info('Airtable connection initialized', {
      baseId: BASE_CONFIG.baseId,
      tables: Object.keys(BASE_CONFIG.tables)
    });

    return base;
  } catch (error) {
    logger.error('Failed to initialize Airtable connection', { error: error.message });
    throw error;
  }
}

/**
 * Test connection to Airtable
 */
async function testConnection(base) {
  try {
    logger.info('Testing Airtable connection...');

    // Try to list records from Users table (limit to 1 to minimize API calls)
    await base(BASE_CONFIG.tables.users).select({
      maxRecords: 1
    }).firstPage();

    logger.info('Airtable connection test successful');
    return true;
  } catch (error) {
    logger.error('Airtable connection test failed', { error: error.message });

    if (error.statusCode === 404) {
      logger.warn('Tables may not exist yet. This is normal for initial setup.');
      return false;
    }

    throw error;
  }
}

/**
 * Create sample user record
 */
async function createSampleUser(base) {
  try {
    const sampleUser = {
      user_id: 'sample_user_001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      whatsapp: '+1234567890',
      job_title: 'Software Developer',
      skill_gaps: ['Python', 'Leadership', 'Data Analysis'],
      learning_format: 'Mixed',
      preferred_time: 'Morning',
      timezone: 'America/New_York',
      registration_date: new Date().toISOString().split('T')[0],
      total_sessions: 0,
      completion_rate: 0,
      status: 'active',
      calendar_email: 'john.doe@example.com',
      notification_preferences: ['Email', 'WhatsApp']
    };

    const record = await base(BASE_CONFIG.tables.users).create(sampleUser);
    logger.info('Sample user created', { recordId: record.id, userId: sampleUser.user_id });

    return record;
  } catch (error) {
    if (error.type === 'INVALID_REQUEST_UNKNOWN' && error.message.includes('user_id')) {
      logger.warn('Sample user may already exist, skipping creation');
      return null;
    }

    logger.error('Failed to create sample user', { error: error.message });
    throw error;
  }
}

/**
 * Create sample lesson records
 */
async function createSampleLessons(base, userId = 'sample_user_001') {
  try {
    const sampleLessons = [
      {
        lesson_id: `${userId}_lesson_001`,
        user_id: userId,
        day: 1,
        title: 'Introduction to Python Basics',
        content_type: 'Video',
        description: 'Learn the fundamentals of Python programming including variables, data types, and basic syntax.',
        keywords: ['Python', 'Programming'],
        difficulty_level: 'Beginner',
        estimated_duration: 5,
        status: 'pending',
        created_date: new Date().toISOString()
      },
      {
        lesson_id: `${userId}_lesson_002`,
        user_id: userId,
        day: 2,
        title: 'Python Control Structures',
        content_type: 'Article',
        description: 'Understanding if statements, loops, and conditional logic in Python.',
        keywords: ['Python', 'Control Structures'],
        difficulty_level: 'Beginner',
        estimated_duration: 5,
        status: 'pending',
        created_date: new Date().toISOString()
      },
      {
        lesson_id: `${userId}_lesson_003`,
        user_id: userId,
        day: 3,
        title: 'Leadership Communication Skills',
        content_type: 'Exercise',
        description: 'Practice effective communication techniques for team leadership.',
        keywords: ['Leadership', 'Communication'],
        difficulty_level: 'Intermediate',
        estimated_duration: 5,
        status: 'pending',
        created_date: new Date().toISOString()
      }
    ];

    const records = await base(BASE_CONFIG.tables.lessons).create(sampleLessons);
    logger.info('Sample lessons created', {
      count: records.length,
      userId: userId,
      lessonIds: records.map(r => r.fields.lesson_id)
    });

    return records;
  } catch (error) {
    logger.error('Failed to create sample lessons', { error: error.message, userId });
    throw error;
  }
}

/**
 * Verify table structure
 */
async function verifyTableStructure(base) {
  try {
    logger.info('Verifying table structure...');

    // Check Users table
    const usersRecords = await base(BASE_CONFIG.tables.users).select({
      maxRecords: 1
    }).firstPage();

    // Check Lessons table
    const lessonsRecords = await base(BASE_CONFIG.tables.lessons).select({
      maxRecords: 1
    }).firstPage();

    logger.info('Table structure verification completed', {
      usersTable: BASE_CONFIG.tables.users,
      lessonsTable: BASE_CONFIG.tables.lessons,
      usersRecordCount: usersRecords.length,
      lessonsRecordCount: lessonsRecords.length
    });

    return true;
  } catch (error) {
    logger.error('Table structure verification failed', { error: error.message });
    return false;
  }
}

/**
 * Main setup function
 */
async function setupAirtable() {
  try {
    logger.info('Starting Airtable setup...');

    // Initialize connection
    const base = initializeAirtable();

    // Test connection
    const connectionOk = await testConnection(base);

    if (!connectionOk) {
      logger.warn('Connection test failed, but continuing with setup...');
    }

    // Create sample data
    const sampleUser = await createSampleUser(base);
    const userId = sampleUser ? sampleUser.fields.user_id : 'sample_user_001';

    await createSampleLessons(base, userId);

    // Verify structure
    await verifyTableStructure(base);

    logger.info('Airtable setup completed successfully');

    return {
      success: true,
      message: 'Airtable setup completed successfully',
      baseId: BASE_CONFIG.baseId,
      tables: BASE_CONFIG.tables
    };

  } catch (error) {
    logger.error('Airtable setup failed', { error: error.message, stack: error.stack });

    return {
      success: false,
      message: `Airtable setup failed: ${error.message}`,
      error: error
    };
  }
}

/**
 * Clean up test data (for development/testing)
 */
async function cleanupTestData(base) {
  try {
    logger.info('Cleaning up test data...');

    // Delete sample lessons
    const lessonsToDelete = await base(BASE_CONFIG.tables.lessons).select({
      filterByFormula: `{user_id} = 'sample_user_001'`
    }).all();

    if (lessonsToDelete.length > 0) {
      await base(BASE_CONFIG.tables.lessons).destroy(lessonsToDelete.map(r => r.id));
      logger.info(`Deleted ${lessonsToDelete.length} sample lessons`);
    }

    // Delete sample user
    const usersToDelete = await base(BASE_CONFIG.tables.users).select({
      filterByFormula: `{user_id} = 'sample_user_001'`
    }).all();

    if (usersToDelete.length > 0) {
      await base(BASE_CONFIG.tables.users).destroy(usersToDelete.map(r => r.id));
      logger.info(`Deleted ${usersToDelete.length} sample users`);
    }

    logger.info('Test data cleanup completed');

  } catch (error) {
    logger.error('Failed to cleanup test data', { error: error.message });
    throw error;
  }
}

// Export functions
module.exports = {
  initializeAirtable,
  testConnection,
  setupAirtable,
  createSampleUser,
  createSampleLessons,
  verifyTableStructure,
  cleanupTestData
};

// Run setup if called directly
if (require.main === module) {
  setupAirtable()
    .then(result => {
      console.log('Setup result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}
