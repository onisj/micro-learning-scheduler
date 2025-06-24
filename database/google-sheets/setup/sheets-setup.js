/**
 * Google Sheets Setup Script
 * Creates and configures Google Sheets for the micro-learning scheduler
 */

const { google } = require('googleapis');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV !== 'test' ? [new winston.transports.File({ filename: './monitoring/logs/sheets-setup.log' })] : [])
  ]
});

/**
 * Google Sheets Configuration
 */
const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './config/google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  sheets: {
    users: 'Users',
    lessons: 'Lessons',
    analytics: 'Analytics',
    engagement: 'Engagement'
  }
};

/**
 * Initialize Google Sheets API
 */
async function initializeGoogleSheets() {
  try {
    // Load service account credentials
    const serviceAccountPath = path.resolve(SHEETS_CONFIG.serviceAccountPath);
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found: ${serviceAccountPath}`);
    }
    
    const credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      SHEETS_CONFIG.scopes
    );
    
    // Authorize the client
    await auth.authorize();
    
    // Create Sheets API instance
    const sheets = google.sheets({ version: 'v4', auth });
    
    logger.info('Google Sheets API initialized successfully', {
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      serviceAccount: credentials.client_email
    });
    
    return { sheets, auth };
  } catch (error) {
    logger.error('Failed to initialize Google Sheets API', { error: error.message });
    throw error;
  }
}

/**
 * Test connection to Google Sheets
 */
async function testConnection(sheets) {
  try {
    logger.info('Testing Google Sheets connection...');
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId
    });
    
    logger.info('Google Sheets connection test successful', {
      title: response.data.properties.title,
      sheetCount: response.data.sheets.length
    });
    
    return response.data;
  } catch (error) {
    logger.error('Google Sheets connection test failed', { error: error.message });
    throw error;
  }
}

/**
 * Create or update sheet headers
 */
async function setupSheetHeaders(sheets, sheetName, headers) {
  try {
    logger.info(`Setting up headers for sheet: ${sheetName}`);
    
    // Clear existing content and add headers
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      range: `${sheetName}!A:Z`
    });
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });
    
    logger.info(`Headers set for sheet: ${sheetName}`, { headers });
    
  } catch (error) {
    logger.error(`Failed to setup headers for sheet: ${sheetName}`, { error: error.message });
    throw error;
  }
}

/**
 * Setup Users sheet
 */
async function setupUsersSheet(sheets) {
  const headers = [
    'user_id', 'name', 'email', 'whatsapp', 'job_title', 'skill_gaps',
    'learning_format', 'preferred_time', 'timezone', 'registration_date',
    'last_learning_session', 'total_sessions', 'completion_rate', 'status',
    'calendar_email', 'notification_preferences', 'created_at', 'updated_at'
  ];
  
  await setupSheetHeaders(sheets, SHEETS_CONFIG.sheets.users, headers);
}

/**
 * Setup Lessons sheet
 */
async function setupLessonsSheet(sheets) {
  const headers = [
    'lesson_id', 'user_id', 'day', 'title', 'content_type', 'description',
    'keywords', 'difficulty_level', 'estimated_duration', 'status',
    'created_date', 'delivery_date', 'completion_date', 'delivery_method',
    'engagement_score', 'user_feedback', 'created_at', 'updated_at'
  ];
  
  await setupSheetHeaders(sheets, SHEETS_CONFIG.sheets.lessons, headers);
}

/**
 * Setup Analytics sheet
 */
async function setupAnalyticsSheet(sheets) {
  const headers = [
    'analytics_id', 'user_id', 'date', 'lessons_delivered', 'lessons_completed',
    'total_engagement_time', 'average_engagement_score', 'completion_rate',
    'preferred_content_type', 'peak_engagement_time', 'created_at', 'updated_at'
  ];
  
  await setupSheetHeaders(sheets, SHEETS_CONFIG.sheets.analytics, headers);
}

/**
 * Setup Engagement sheet
 */
async function setupEngagementSheet(sheets) {
  const headers = [
    'engagement_id', 'user_id', 'lesson_id', 'interaction_type', 'timestamp',
    'duration', 'device_type', 'location', 'created_at', 'updated_at'
  ];
  
  await setupSheetHeaders(sheets, SHEETS_CONFIG.sheets.engagement, headers);
}

/**
 * Create sample data in sheets
 */
async function createSampleData(sheets) {
  try {
    logger.info('Creating sample data in Google Sheets...');
    
    // Sample user data
    const sampleUsers = [
      [
        'sample_user_001', 'John Doe', 'john.doe@example.com', '+1234567890',
        'Software Developer', 'Python,Leadership,Data Analysis', 'Mixed', 'Morning',
        'America/New_York', '2024-01-15', '', '0', '0', 'active',
        'john.doe@example.com', 'Email,WhatsApp', new Date().toISOString(), new Date().toISOString()
      ]
    ];
    
    // Sample lesson data
    const sampleLessons = [
      [
        'sample_user_001_lesson_001', 'sample_user_001', '1', 'Introduction to Python Basics',
        'Video', 'Learn the fundamentals of Python programming including variables, data types, and basic syntax.',
        'Python,Programming', 'Beginner', '5', 'pending', new Date().toISOString(),
        '', '', 'email', '', '', new Date().toISOString(), new Date().toISOString()
      ]
    ];
    
    // Add sample users
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      range: `${SHEETS_CONFIG.sheets.users}!A2`,
      valueInputOption: 'RAW',
      resource: {
        values: sampleUsers
      }
    });
    
    // Add sample lessons
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      range: `${SHEETS_CONFIG.sheets.lessons}!A2`,
      valueInputOption: 'RAW',
      resource: {
        values: sampleLessons
      }
    });
    
    logger.info('Sample data created successfully');
    
  } catch (error) {
    logger.error('Failed to create sample data', { error: error.message });
    throw error;
  }
}

/**
 * Verify sheet structure
 */
async function verifySheetStructure(sheets) {
  try {
    logger.info('Verifying sheet structure...');
    
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId
    });
    
    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    const requiredSheets = Object.values(SHEETS_CONFIG.sheets);
    
    const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
    
    if (missingSheets.length > 0) {
      logger.warn('Missing sheets detected', { missingSheets });
      
      // Create missing sheets
      for (const sheetName of missingSheets) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEETS_CONFIG.spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }]
          }
        });
        
        logger.info(`Created missing sheet: ${sheetName}`);
      }
    }
    
    logger.info('Sheet structure verification completed', {
      existingSheets,
      requiredSheets,
      missingSheets
    });
    
    return true;
  } catch (error) {
    logger.error('Sheet structure verification failed', { error: error.message });
    return false;
  }
}

/**
 * Main setup function
 */
async function setupGoogleSheets() {
  try {
    logger.info('Starting Google Sheets setup...');
    
    // Initialize API
    const { sheets } = await initializeGoogleSheets();
    
    // Test connection
    await testConnection(sheets);
    
    // Verify and create sheet structure
    await verifySheetStructure(sheets);
    
    // Setup sheet headers
    await setupUsersSheet(sheets);
    await setupLessonsSheet(sheets);
    await setupAnalyticsSheet(sheets);
    await setupEngagementSheet(sheets);
    
    // Create sample data
    await createSampleData(sheets);
    
    logger.info('Google Sheets setup completed successfully');
    
    return {
      success: true,
      message: 'Google Sheets setup completed successfully',
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      sheets: SHEETS_CONFIG.sheets
    };
    
  } catch (error) {
    logger.error('Google Sheets setup failed', { error: error.message, stack: error.stack });
    
    return {
      success: false,
      message: `Google Sheets setup failed: ${error.message}`,
      error: error
    };
  }
}

/**
 * Clean up test data (for development/testing)
 */
async function cleanupTestData(sheets) {
  try {
    logger.info('Cleaning up test data from Google Sheets...');
    
    // Clear all data except headers
    const sheetsToClean = Object.values(SHEETS_CONFIG.sheets);
    
    for (const sheetName of sheetsToClean) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        range: `${sheetName}!A2:Z`
      });
      
      logger.info(`Cleared data from sheet: ${sheetName}`);
    }
    
    logger.info('Test data cleanup completed');
    
  } catch (error) {
    logger.error('Failed to cleanup test data', { error: error.message });
    throw error;
  }
}

// Export functions
module.exports = {
  SHEETS_CONFIG,
  initializeGoogleSheets,
  testConnection,
  setupGoogleSheets,
  setupUsersSheet,
  setupLessonsSheet,
  setupAnalyticsSheet,
  setupEngagementSheet,
  createSampleData,
  verifySheetStructure,
  cleanupTestData
};

// Run setup if called directly
if (require.main === module) {
  setupGoogleSheets()
    .then(result => {
      console.log('Setup result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}
