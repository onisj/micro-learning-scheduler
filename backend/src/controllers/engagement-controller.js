// Engagement Controller

/**
 * Engagement Controller
 * Handles engagement tracking and analytics for the micro-learning scheduler
 */

const express = require('express');
const { asyncHandler } = require('../middleware/error-handling');
const logger = require('../utils/logging-utils');
const Airtable = require('airtable');
const { google } = require('googleapis');

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
 * @route   POST /api/engagement/track
 * @desc    Track user engagement event
 * @access  Public
 */
router.post('/track', asyncHandler(async (req, res) => {
  const {
    user_id,
    event_type,
    lesson_id,
    engagement_data,
    timestamp
  } = req.body;

  // Validate required fields
  if (!user_id || !event_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: user_id, event_type'
    });
  }

  try {
    const engagementRecord = {
      user_id,
      event_type,
      lesson_id: lesson_id || '',
      engagement_data: JSON.stringify(engagement_data || {}),
      timestamp: timestamp || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    // Log to Google Sheets (Engagement sheet)
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Engagement!A:F',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              engagementRecord.timestamp,
              engagementRecord.user_id,
              engagementRecord.event_type,
              engagementRecord.lesson_id,
              engagementRecord.engagement_data,
              engagementRecord.date
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets engagement logging',
          user_id,
          event_type
        });
      }
    }

    // Log engagement event
    logger.logEngagement(event_type, user_id, {
      lesson_id,
      engagement_data,
      timestamp: engagementRecord.timestamp
    });

    res.json({
      success: true,
      message: 'Engagement tracked successfully',
      data: engagementRecord
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/engagement/track',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   GET /api/engagement/user/:user_id
 * @desc    Get engagement data for specific user
 * @access  Public (should be protected in production)
 */
router.get('/user/:user_id', asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { start_date, end_date, event_type } = req.query;

  try {
    // Get engagement data from Google Sheets
    if (!process.env.GOOGLE_SHEETS_ID) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not configured'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Engagement!A:F'
    });

    const rows = response.data.values || [];
    const headers = rows[0] || ['timestamp', 'user_id', 'event_type', 'lesson_id', 'engagement_data', 'date'];
    const data = rows.slice(1);

    // Filter data for the specific user
    let userEngagement = data
      .filter(row => row[1] === user_id)
      .map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] || '';
        });
        return record;
      });

    // Apply additional filters
    if (start_date) {
      userEngagement = userEngagement.filter(record => 
        record.date >= start_date
      );
    }

    if (end_date) {
      userEngagement = userEngagement.filter(record => 
        record.date <= end_date
      );
    }

    if (event_type) {
      userEngagement = userEngagement.filter(record => 
        record.event_type === event_type
      );
    }

    // Calculate engagement metrics
    const metrics = {
      total_events: userEngagement.length,
      event_types: [...new Set(userEngagement.map(e => e.event_type))],
      daily_activity: {},
      lesson_engagement: {}
    };

    // Group by date
    userEngagement.forEach(event => {
      const date = event.date;
      if (!metrics.daily_activity[date]) {
        metrics.daily_activity[date] = 0;
      }
      metrics.daily_activity[date]++;

      // Group by lesson
      if (event.lesson_id) {
        if (!metrics.lesson_engagement[event.lesson_id]) {
          metrics.lesson_engagement[event.lesson_id] = 0;
        }
        metrics.lesson_engagement[event.lesson_id]++;
      }
    });

    res.json({
      success: true,
      data: {
        user_id,
        metrics,
        events: userEngagement
      }
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: `/api/engagement/user/${user_id}`,
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   GET /api/engagement/analytics
 * @desc    Get overall engagement analytics
 * @access  Public (should be protected in production)
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const { start_date, end_date, user_id } = req.query;

  try {
    // Get all engagement data from Google Sheets
    if (!process.env.GOOGLE_SHEETS_ID) {
      return res.status(503).json({
        success: false,
        error: 'Google Sheets not configured'
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Engagement!A:F'
    });

    const rows = response.data.values || [];
    const headers = rows[0] || ['timestamp', 'user_id', 'event_type', 'lesson_id', 'engagement_data', 'date'];
    const data = rows.slice(1);

    // Convert to objects
    let engagementData = data.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });

    // Apply filters
    if (start_date) {
      engagementData = engagementData.filter(record => 
        record.date >= start_date
      );
    }

    if (end_date) {
      engagementData = engagementData.filter(record => 
        record.date <= end_date
      );
    }

    if (user_id) {
      engagementData = engagementData.filter(record => 
        record.user_id === user_id
      );
    }

    // Calculate analytics
    const analytics = {
      total_events: engagementData.length,
      unique_users: new Set(engagementData.map(e => e.user_id)).size,
      event_types: {},
      daily_activity: {},
      user_activity: {},
      lesson_engagement: {}
    };

    // Process data
    engagementData.forEach(event => {
      // Event types
      if (!analytics.event_types[event.event_type]) {
        analytics.event_types[event.event_type] = 0;
      }
      analytics.event_types[event.event_type]++;

      // Daily activity
      if (!analytics.daily_activity[event.date]) {
        analytics.daily_activity[event.date] = 0;
      }
      analytics.daily_activity[event.date]++;

      // User activity
      if (!analytics.user_activity[event.user_id]) {
        analytics.user_activity[event.user_id] = 0;
      }
      analytics.user_activity[event.user_id]++;

      // Lesson engagement
      if (event.lesson_id) {
        if (!analytics.lesson_engagement[event.lesson_id]) {
          analytics.lesson_engagement[event.lesson_id] = 0;
        }
        analytics.lesson_engagement[event.lesson_id]++;
      }
    });

    // Calculate averages
    const totalDays = Object.keys(analytics.daily_activity).length;
    analytics.average_daily_events = totalDays > 0 
      ? Math.round(analytics.total_events / totalDays * 100) / 100 
      : 0;

    analytics.average_user_events = analytics.unique_users > 0 
      ? Math.round(analytics.total_events / analytics.unique_users * 100) / 100 
      : 0;

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/engagement/analytics',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   POST /api/engagement/lesson-interaction
 * @desc    Track specific lesson interaction
 * @access  Public
 */
router.post('/lesson-interaction', asyncHandler(async (req, res) => {
  const {
    user_id,
    lesson_id,
    interaction_type,
    duration,
    completion_percentage,
    quiz_score,
    feedback
  } = req.body;

  // Validate required fields
  if (!user_id || !lesson_id || !interaction_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: user_id, lesson_id, interaction_type'
    });
  }

  try {
    const interactionData = {
      user_id,
      lesson_id,
      interaction_type,
      duration: duration || 0,
      completion_percentage: completion_percentage || 0,
      quiz_score: quiz_score || null,
      feedback: feedback || '',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    // Log to Google Sheets (Engagement sheet)
    if (process.env.GOOGLE_SHEETS_ID) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Engagement!A:F',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              interactionData.timestamp,
              interactionData.user_id,
              'lesson_interaction',
              interactionData.lesson_id,
              JSON.stringify({
                interaction_type,
                duration,
                completion_percentage,
                quiz_score,
                feedback
              }),
              interactionData.date
            ]]
          }
        });
      } catch (sheetsError) {
        logger.logError(sheetsError, {
          context: 'Google Sheets lesson interaction logging',
          user_id,
          lesson_id
        });
      }
    }

    // Update lesson engagement score if it's a completion
    if (interaction_type === 'completed' && completion_percentage >= 80) {
      try {
        const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
          .select({
            filterByFormula: `{lesson_id} = '${lesson_id}'`,
            maxRecords: 1
          })
          .all();

        if (lessonRecords.length > 0) {
          const engagementScore = Math.min(100, 
            (completion_percentage * 0.7) + 
            (quiz_score ? quiz_score * 0.3 : 0)
          );

          await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
            .update(lessonRecords[0].id, {
              engagement_score: Math.round(engagementScore)
            });
        }
      } catch (lessonUpdateError) {
        logger.logError(lessonUpdateError, {
          context: 'Updating lesson engagement score',
          lesson_id,
          user_id
        });
      }
    }

    logger.logEngagement('lesson_interaction', user_id, interactionData);

    res.json({
      success: true,
      message: 'Lesson interaction tracked successfully',
      data: interactionData
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/engagement/lesson-interaction',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   GET /api/engagement/summary/:user_id
 * @desc    Get engagement summary for user
 * @access  Public (should be protected in production)
 */
router.get('/summary/:user_id', asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { days = 30 } = req.query;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get user lessons data
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `{user_id} = '${user_id}'`,
        sort: [{ field: 'day', direction: 'desc' }]
      })
      .all();

    const lessons = lessonRecords.map(record => record.fields);
    const completedLessons = lessons.filter(lesson => lesson.status === 'completed');
    
    const summary = {
      user_id,
      period_days: parseInt(days),
      total_lessons: lessons.length,
      completed_lessons: completedLessons.length,
      completion_rate: lessons.length > 0 
        ? Math.round((completedLessons.length / lessons.length) * 100) 
        : 0,
      average_engagement_score: completedLessons.length > 0 
        ? Math.round(completedLessons.reduce((sum, l) => sum + (l.engagement_score || 0), 0) / completedLessons.length)
        : 0,
      streak_days: calculateStreakDays(lessons),
      last_activity: lessons.length > 0 
        ? Math.max(...lessons.map(l => new Date(l.completion_time || l.created_date).getTime()))
        : null
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: `/api/engagement/summary/${user_id}`,
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * Helper function to calculate streak days
 */
function calculateStreakDays(lessons) {
  const completedLessons = lessons
    .filter(lesson => lesson.status === 'completed')
    .sort((a, b) => new Date(b.completion_time) - new Date(a.completion_time));

  if (completedLessons.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const lesson of completedLessons) {
    const lessonDate = new Date(lesson.completion_time);
    lessonDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - lessonDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff === streak + 1) {
      // Allow for one day gap
      streak++;
      currentDate.setDate(currentDate.getDate() - 2);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = router;
