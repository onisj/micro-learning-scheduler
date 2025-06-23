// User Controller

/**
 * User Controller
 * Handles user-related API endpoints for the micro-learning scheduler
 */

const express = require('express');
const { asyncHandler } = require('../middleware/error-handling');
const logger = require('../utils/logging-utils');
const Airtable = require('airtable');

const router = express.Router();

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filtering
 * @access  Public (should be protected in production)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  try {
    let filterFormula = '';
    if (status) {
      filterFormula = `{status} = '${status}'`;
    }

    const records = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .select({
        maxRecords: parseInt(limit),
        ...(filterFormula && { filterByFormula: filterFormula }),
        sort: [{ field: 'registration_date', direction: 'desc' }]
      })
      .all();

    const users = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    logger.logApiCall(req.originalUrl, req.method, 200, Date.now(), {
      userCount: users.length,
      filters: { status, limit, offset }
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/users',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Public (should be protected in production)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const record = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .find(id);

    const user = {
      id: record.id,
      ...record.fields
    };

    logger.logApiCall(req.originalUrl, req.method, 200, Date.now(), {
      userId: id
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/users/${id}`,
      method: 'GET'
    });
    throw error;
  }
}));

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Public
 */
router.post('/', asyncHandler(async (req, res) => {
  const {
    name,
    email,
    whatsapp,
    job_title,
    skill_gaps,
    learning_format,
    preferred_time,
    timezone,
    calendar_email,
    notification_preferences
  } = req.body;

  // Validate required fields
  if (!name || !email || !skill_gaps) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, email, skill_gaps'
    });
  }

  try {
    // Create user ID from email
    const user_id = email.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Check if user already exists
    const existingUsers = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1
      })
      .all();

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user record
    const record = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .create({
        user_id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        whatsapp: whatsapp?.replace(/[^0-9+]/g, '') || '',
        job_title: job_title || 'Professional',
        skill_gaps: Array.isArray(skill_gaps) ? skill_gaps : skill_gaps.split(',').map(s => s.trim()),
        learning_format: learning_format || 'Mixed',
        preferred_time: preferred_time || 'Morning',
        timezone: timezone || 'UTC',
        calendar_email: calendar_email || email,
        notification_preferences: notification_preferences || ['Email'],
        registration_date: new Date().toISOString().split('T')[0],
        last_learning_session: null,
        total_sessions: 0,
        completion_rate: 0,
        status: 'active'
      });

    const user = {
      id: record.id,
      ...record.fields
    };

    logger.logUserAction('user_created', user_id, {
      email,
      job_title,
      skill_gaps
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/users',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Public (should be protected in production)
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Remove fields that shouldn't be updated directly
    delete updateData.user_id;
    delete updateData.registration_date;
    delete updateData.total_sessions;

    const record = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .update(id, updateData);

    const user = {
      id: record.id,
      ...record.fields
    };

    logger.logUserAction('user_updated', user.user_id, {
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/users/${id}`,
      method: 'PUT',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete by setting status to inactive)
 * @access  Public (should be protected in production)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const record = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .update(id, {
        status: 'inactive',
        deactivation_date: new Date().toISOString().split('T')[0]
      });

    logger.logUserAction('user_deactivated', record.fields.user_id);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/users/${id}`,
      method: 'DELETE'
    });
    throw error;
  }
}));

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user learning statistics
 * @access  Public (should be protected in production)
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Get user record
    const userRecord = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .find(id);

    // Get user's lessons
    const lessonRecords = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `{user_id} = '${userRecord.fields.user_id}'`,
        sort: [{ field: 'day', direction: 'asc' }]
      })
      .all();

    const lessons = lessonRecords.map(record => record.fields);
    const completedLessons = lessons.filter(lesson => lesson.status === 'completed');
    const totalLessons = lessons.length;
    const completionRate = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

    const stats = {
      user_id: userRecord.fields.user_id,
      name: userRecord.fields.name,
      total_lessons: totalLessons,
      completed_lessons: completedLessons.length,
      completion_rate: Math.round(completionRate * 100) / 100,
      current_day: Math.max(...lessons.map(l => l.day || 0), 0),
      last_activity: userRecord.fields.last_learning_session,
      status: userRecord.fields.status,
      registration_date: userRecord.fields.registration_date
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/users/${id}/stats`,
      method: 'GET'
    });
    throw error;
  }
}));

module.exports = router;
