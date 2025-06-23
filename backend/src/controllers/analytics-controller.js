// Analytics Controller

/**
 * Analytics Controller
 * Handles analytics and reporting for the micro-learning scheduler
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
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics overview
 * @access  Public (should be protected in production)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get users data
    const userRecords = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .select({
        filterByFormula: `{registration_date} >= '${startDate.toISOString().split('T')[0]}'`
      })
      .all();

    const users = userRecords.map(record => record.fields);
    const activeUsers = users.filter(user => user.status === 'active');

    // Get lessons data
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `{created_date} >= '${startDate.toISOString().split('T')[0]}'`
      })
      .all();

    const lessons = lessonRecords.map(record => record.fields);
    const completedLessons = lessons.filter(lesson => lesson.status === 'completed');

    // Calculate metrics
    const totalUsers = users.length;
    const totalLessons = lessons.length;
    const completionRate = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
    const averageEngagement = completedLessons.length > 0 
      ? completedLessons.reduce((sum, lesson) => sum + (lesson.engagement_score || 0), 0) / completedLessons.length
      : 0;

    // Daily activity
    const dailyActivity = {};
    lessons.forEach(lesson => {
      const date = lesson.created_date;
      if (!dailyActivity[date]) {
        dailyActivity[date] = { created: 0, completed: 0 };
      }
      dailyActivity[date].created++;
      if (lesson.status === 'completed') {
        dailyActivity[date].completed++;
      }
    });

    // User registration trend
    const registrationTrend = {};
    users.forEach(user => {
      const date = user.registration_date;
      if (!registrationTrend[date]) {
        registrationTrend[date] = 0;
      }
      registrationTrend[date]++;
    });

    const dashboard = {
      period_days: parseInt(period),
      overview: {
        total_users: totalUsers,
        active_users: activeUsers.length,
        total_lessons: totalLessons,
        completed_lessons: completedLessons.length,
        completion_rate: Math.round(completionRate * 100) / 100,
        average_engagement: Math.round(averageEngagement * 100) / 100
      },
      trends: {
        daily_activity: dailyActivity,
        registration_trend: registrationTrend
      },
      top_performers: activeUsers
        .sort((a, b) => (b.completion_rate || 0) - (a.completion_rate || 0))
        .slice(0, 10)
        .map(user => ({
          user_id: user.user_id,
          name: user.name,
          completion_rate: user.completion_rate || 0,
          total_sessions: user.total_sessions || 0
        }))
    };

    logger.logApiCall(req.originalUrl, req.method, 200, Date.now(), {
      period,
      totalUsers,
      totalLessons
    });

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/analytics/dashboard',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   GET /api/analytics/user-performance
 * @desc    Get detailed user performance analytics
 * @access  Public (should be protected in production)
 */
router.get('/user-performance', asyncHandler(async (req, res) => {
  const { user_id, period = '30' } = req.query;
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    let filterFormula = `{created_date} >= '${startDate.toISOString().split('T')[0]}'`;
    if (user_id) {
      filterFormula = `AND(${filterFormula}, {user_id} = '${user_id}')`;
    }

    // Get lessons data
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'day', direction: 'asc' }]
      })
      .all();

    const lessons = lessonRecords.map(record => record.fields);

    // Group by user
    const userPerformance = {};
    lessons.forEach(lesson => {
      const userId = lesson.user_id;
      if (!userPerformance[userId]) {
        userPerformance[userId] = {
          user_id: userId,
          total_lessons: 0,
          completed_lessons: 0,
          pending_lessons: 0,
          total_engagement: 0,
          daily_progress: {},
          skill_areas: {}
        };
      }

      const userStats = userPerformance[userId];
      userStats.total_lessons++;

      if (lesson.status === 'completed') {
        userStats.completed_lessons++;
        userStats.total_engagement += lesson.engagement_score || 0;

        // Daily progress
        const date = lesson.completion_time ? lesson.completion_time.split('T')[0] : lesson.created_date;
        if (!userStats.daily_progress[date]) {
          userStats.daily_progress[date] = 0;
        }
        userStats.daily_progress[date]++;
      } else {
        userStats.pending_lessons++;
      }

      // Track skill areas (from topic)
      if (lesson.topic) {
        if (!userStats.skill_areas[lesson.topic]) {
          userStats.skill_areas[lesson.topic] = { total: 0, completed: 0 };
        }
        userStats.skill_areas[lesson.topic].total++;
        if (lesson.status === 'completed') {
          userStats.skill_areas[lesson.topic].completed++;
        }
      }
    });

    // Calculate derived metrics
    Object.values(userPerformance).forEach(userStats => {
      userStats.completion_rate = userStats.total_lessons > 0 
        ? Math.round((userStats.completed_lessons / userStats.total_lessons) * 100)
        : 0;
      userStats.average_engagement = userStats.completed_lessons > 0 
        ? Math.round(userStats.total_engagement / userStats.completed_lessons)
        : 0;
      userStats.streak_days = calculateUserStreak(userStats.daily_progress);
    });

    const performanceData = {
      period_days: parseInt(period),
      user_count: Object.keys(userPerformance).length,
      performance: user_id ? userPerformance[user_id] || null : userPerformance
    };

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/analytics/user-performance',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   GET /api/analytics/content-performance
 * @desc    Get content performance analytics
 * @access  Public (should be protected in production)
 */
router.get('/content-performance', asyncHandler(async (req, res) => {
  const { topic, period = '30' } = req.query;
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    let filterFormula = `{created_date} >= '${startDate.toISOString().split('T')[0]}'`;
    if (topic) {
      filterFormula = `AND(${filterFormula}, {topic} = '${topic}')`;
    }

    // Get lessons data
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: filterFormula
      })
      .all();

    const lessons = lessonRecords.map(record => record.fields);

    // Group by topic
    const topicPerformance = {};
    lessons.forEach(lesson => {
      const lessonTopic = lesson.topic || 'Unknown';
      if (!topicPerformance[lessonTopic]) {
        topicPerformance[lessonTopic] = {
          topic: lessonTopic,
          total_lessons: 0,
          completed_lessons: 0,
          total_engagement: 0,
          unique_users: new Set(),
          difficulty_breakdown: {},
          format_breakdown: {}
        };
      }

      const topicStats = topicPerformance[lessonTopic];
      topicStats.total_lessons++;
      topicStats.unique_users.add(lesson.user_id);

      if (lesson.status === 'completed') {
        topicStats.completed_lessons++;
        topicStats.total_engagement += lesson.engagement_score || 0;
      }

      // Difficulty breakdown
      const difficulty = lesson.difficulty || 'unknown';
      if (!topicStats.difficulty_breakdown[difficulty]) {
        topicStats.difficulty_breakdown[difficulty] = { total: 0, completed: 0 };
      }
      topicStats.difficulty_breakdown[difficulty].total++;
      if (lesson.status === 'completed') {
        topicStats.difficulty_breakdown[difficulty].completed++;
      }

      // Format breakdown
      const format = lesson.format || 'unknown';
      if (!topicStats.format_breakdown[format]) {
        topicStats.format_breakdown[format] = { total: 0, completed: 0 };
      }
      topicStats.format_breakdown[format].total++;
      if (lesson.status === 'completed') {
        topicStats.format_breakdown[format].completed++;
      }
    });

    // Calculate derived metrics and convert Set to count
    Object.values(topicPerformance).forEach(topicStats => {
      topicStats.completion_rate = topicStats.total_lessons > 0 
        ? Math.round((topicStats.completed_lessons / topicStats.total_lessons) * 100)
        : 0;
      topicStats.average_engagement = topicStats.completed_lessons > 0 
        ? Math.round(topicStats.total_engagement / topicStats.completed_lessons)
        : 0;
      topicStats.unique_users = topicStats.unique_users.size;
    });

    // Sort by completion rate
    const sortedTopics = Object.values(topicPerformance)
      .sort((a, b) => b.completion_rate - a.completion_rate);

    const contentData = {
      period_days: parseInt(period),
      topic_count: Object.keys(topicPerformance).length,
      performance: topic ? topicPerformance[topic] || null : sortedTopics
    };

    res.json({
      success: true,
      data: contentData
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/analytics/content-performance',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * Helper function to calculate user streak
 */
function calculateUserStreak(dailyProgress) {
  const dates = Object.keys(dailyProgress).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const progressDate = new Date(dateStr);
    progressDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - progressDate) / (1000 * 60 * 60 * 24));

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
