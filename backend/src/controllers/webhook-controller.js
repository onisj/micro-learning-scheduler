/**
 * Webhook Controller
 * Handles webhook endpoints for n8n workflow integration
 */

const express = require('express');
const { asyncHandler } = require('../middleware/error-handling');
const logger = require('../utils/logging-utils');
const Airtable = require('airtable');
const { google } = require('googleapis');
const crypto = require('crypto');

const router = express.Router();

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * @route   POST /webhook/user-registration
 * @desc    Handle user registration from n8n workflow
 * @access  Public (webhook)
 */
router.post('/user-registration', asyncHandler(async (req, res) => {
  const { name, email, phone, learning_goals, preferred_time, timezone } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Generate unique user ID
    const user_id = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const registration_date = new Date().toISOString().split('T')[0];

    // Create user record in Airtable
    const userRecord = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .create({
        user_id,
        name,
        email,
        phone: phone || '',
        learning_goals: learning_goals || '',
        preferred_time: preferred_time || '08:00',
        timezone: timezone || 'UTC',
        registration_date,
        status: 'active',
        total_sessions: 0,
        completion_rate: 0,
        last_activity: registration_date
      });

    // Log user registration event
    logger.logUserAction(user_id, 'user_registration', {
      name,
      email,
      learning_goals,
      preferred_time,
      timezone
    });

    // Log to Google Sheets for analytics
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Engagement!A:H',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              new Date().toISOString(),
              user_id,
              'user_registration',
              'registration',
              JSON.stringify({ name, email, learning_goals }),
              1,
              registration_date,
              timezone
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets logging failed during user registration',
          user_id
        });
      }
    }

    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id,
        name,
        email,
        registration_date,
        airtable_record_id: userRecord.id
      }
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/webhook/user-registration',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   POST /webhook/lesson-completion
 * @desc    Handle lesson completion from n8n workflow
 * @access  Public (webhook)
 */
router.post('/lesson-completion', asyncHandler(async (req, res) => {
  const { 
    user_id, 
    lesson_id, 
    completion_time, 
    duration_minutes, 
    quiz_score, 
    feedback 
  } = req.body;
  
  try {
    // Validate required fields
    if (!user_id || !lesson_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID and lesson ID are required'
      });
    }

    // Find and update lesson in Airtable
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `AND({user_id} = '${user_id}', {lesson_id} = '${lesson_id}')`
      })
      .all();

    if (lessonRecords.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    const lessonRecord = lessonRecords[0];
    const currentTime = new Date().toISOString();
    
    // Calculate engagement score based on completion time and quiz score
    let engagementScore = 50; // Base score
    if (duration_minutes && duration_minutes <= 7) engagementScore += 20; // Completed within time
    if (quiz_score && quiz_score >= 80) engagementScore += 30; // Good quiz performance
    if (feedback && feedback.length > 10) engagementScore += 10; // Provided feedback
    
    // Update lesson record
    await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .update(lessonRecord.id, {
        status: 'completed',
        completion_time: completion_time || currentTime,
        duration_minutes: duration_minutes || 0,
        quiz_score: quiz_score || 0,
        feedback: feedback || '',
        engagement_score: Math.min(engagementScore, 100)
      });

    // Update user statistics
    const userRecords = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .select({
        filterByFormula: `{user_id} = '${user_id}'`
      })
      .all();

    if (userRecords.length > 0) {
      const userRecord = userRecords[0];
      const currentSessions = userRecord.fields.total_sessions || 0;
      
      // Calculate new completion rate
      const allUserLessons = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
        .select({
          filterByFormula: `{user_id} = '${user_id}'`
        })
        .all();
      
      const completedLessons = allUserLessons.filter(lesson => 
        lesson.fields.status === 'completed'
      ).length;
      
      const completionRate = allUserLessons.length > 0 
        ? Math.round((completedLessons / allUserLessons.length) * 100)
        : 0;

      await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
        .update(userRecord.id, {
          total_sessions: currentSessions + 1,
          completion_rate: completionRate,
          last_activity: currentTime.split('T')[0]
        });
    }

    // Log completion event
    logger.logUserAction(user_id, 'lesson_completion', {
      lesson_id,
      duration_minutes,
      quiz_score,
      engagement_score: engagementScore
    });

    // Log to Google Sheets for analytics
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Engagement!A:H',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              currentTime,
              user_id,
              'lesson_completion',
              'learning',
              JSON.stringify({ 
                lesson_id, 
                duration_minutes, 
                quiz_score, 
                engagement_score: engagementScore 
              }),
              engagementScore,
              currentTime.split('T')[0],
              'UTC'
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets logging failed during lesson completion',
          user_id,
          lesson_id
        });
      }
    }

    res.json({
      success: true,
      message: 'Lesson completion recorded successfully',
      data: {
        user_id,
        lesson_id,
        engagement_score: engagementScore,
        completion_time: completion_time || currentTime
      }
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/webhook/lesson-completion',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   POST /webhook/engagement-tracking
 * @desc    Handle engagement tracking from n8n workflow
 * @access  Public (webhook)
 */
router.post('/engagement-tracking', asyncHandler(async (req, res) => {
  const { 
    user_id, 
    event_type, 
    event_data, 
    timestamp 
  } = req.body;
  
  try {
    // Validate required fields
    if (!user_id || !event_type) {
      return res.status(400).json({
        success: false,
        error: 'User ID and event type are required'
      });
    }

    const eventTime = timestamp || new Date().toISOString();
    const eventDate = eventTime.split('T')[0];

    // Log engagement event
    logger.logEngagement(user_id, event_type, event_data || {});

    // Log to Google Sheets for analytics
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Engagement!A:H',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              eventTime,
              user_id,
              event_type,
              'engagement',
              JSON.stringify(event_data || {}),
              1,
              eventDate,
              'UTC'
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets logging failed during engagement tracking',
          user_id,
          event_type
        });
      }
    }

    res.json({
      success: true,
      message: 'Engagement event tracked successfully',
      data: {
        user_id,
        event_type,
        timestamp: eventTime
      }
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/webhook/engagement-tracking',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   POST /webhook/workflow-status
 * @desc    Handle workflow status updates from n8n
 * @access  Public (webhook)
 */
router.post('/workflow-status', asyncHandler(async (req, res) => {
  const { 
    workflow_id, 
    workflow_name, 
    execution_id, 
    status, 
    error_message, 
    execution_time 
  } = req.body;
  
  try {
    const statusTime = new Date().toISOString();
    
    // Log workflow status
    logger.logWorkflowEvent(workflow_id, workflow_name, {
      execution_id,
      status,
      error_message,
      execution_time
    });

    // Log to Google Sheets for monitoring
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Performance!A:H',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              statusTime,
              workflow_id,
              workflow_name,
              execution_id,
              status,
              error_message || '',
              execution_time || 0,
              statusTime.split('T')[0]
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets logging failed during workflow status update',
          workflow_id,
          execution_id
        });
      }
    }

    res.json({
      success: true,
      message: 'Workflow status recorded successfully',
      data: {
        workflow_id,
        execution_id,
        status,
        timestamp: statusTime
      }
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/webhook/workflow-status',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   GET /webhook/health
 * @desc    Health check endpoint for n8n workflows
 * @access  Public (webhook)
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        airtable: 'unknown',
        google_sheets: 'unknown'
      }
    };

    // Check Airtable connection
    try {
      await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
        .select({ maxRecords: 1 })
        .firstPage();
      healthStatus.services.airtable = 'healthy';
    } catch (airtableError) {
      healthStatus.services.airtable = 'error';
      healthStatus.status = 'degraded';
    }

    // Check Google Sheets connection
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID
        });
        healthStatus.services.google_sheets = 'healthy';
      } catch (sheetsError) {
        healthStatus.services.google_sheets = 'error';
        healthStatus.status = 'degraded';
      }
    } else {
      healthStatus.services.google_sheets = 'not_configured';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      data: healthStatus
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/webhook/health',
      method: 'GET'
    });
    
    res.status(500).json({
      success: false,
      data: {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }
    });
  }
}));

module.exports = router;