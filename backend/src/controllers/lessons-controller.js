/**
 * Lessons Controller
 * Handles lesson-related API endpoints for the micro-learning scheduler
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
 * @route   GET /api/lessons
 * @desc    Get all lessons with optional filtering
 * @access  Public (should be protected in production)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { user_id, status, day, limit = 50, offset = 0 } = req.query;
  
  try {
    let filterFormula = '';
    const filters = [];
    
    if (user_id) {
      filters.push(`{user_id} = '${user_id}'`);
    }
    if (status) {
      filters.push(`{status} = '${status}'`);
    }
    if (day) {
      filters.push(`{day} = ${parseInt(day)}`);
    }
    
    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
    }

    const records = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        maxRecords: parseInt(limit),
        ...(filterFormula && { filterByFormula: filterFormula }),
        sort: [{ field: 'day', direction: 'asc' }]
      })
      .all();

    const lessons = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    logger.logApiCall(req.originalUrl, req.method, 200, Date.now(), {
      lessonCount: lessons.length,
      filters: { user_id, status, day, limit, offset }
    });

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/lessons',
      method: 'GET',
      query: req.query
    });
    throw error;
  }
}));

/**
 * @route   GET /api/lessons/:id
 * @desc    Get single lesson by ID
 * @access  Public (should be protected in production)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const record = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .find(id);

    const lesson = {
      id: record.id,
      ...record.fields
    };

    logger.logApiCall(req.originalUrl, req.method, 200, Date.now(), {
      lessonId: id
    });

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/lessons/${id}`,
      method: 'GET'
    });
    throw error;
  }
}));

/**
 * @route   POST /api/lessons
 * @desc    Create new lesson
 * @access  Public
 */
router.post('/', asyncHandler(async (req, res) => {
  const {
    user_id,
    day,
    topic,
    content,
    format,
    duration,
    difficulty,
    learning_objectives,
    resources,
    quiz_questions
  } = req.body;

  // Validate required fields
  if (!user_id || !day || !topic || !content) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: user_id, day, topic, content'
    });
  }

  try {
    // Check if lesson already exists for this user and day
    const existingLessons = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `AND({user_id} = '${user_id}', {day} = ${parseInt(day)})`,
        maxRecords: 1
      })
      .all();

    if (existingLessons.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Lesson already exists for user ${user_id} on day ${day}`
      });
    }

    // Create lesson ID
    const lesson_id = `${user_id}_day_${day}`;

    // Create new lesson record
    const record = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .create({
        lesson_id,
        user_id,
        day: parseInt(day),
        topic: topic.trim(),
        content: content.trim(),
        format: format || 'text',
        duration: duration || 5,
        difficulty: difficulty || 'beginner',
        learning_objectives: Array.isArray(learning_objectives) 
          ? learning_objectives 
          : (learning_objectives ? learning_objectives.split(',').map(s => s.trim()) : []),
        resources: Array.isArray(resources) 
          ? resources 
          : (resources ? resources.split(',').map(s => s.trim()) : []),
        quiz_questions: quiz_questions || [],
        status: 'pending',
        created_date: new Date().toISOString().split('T')[0],
        scheduled_time: null,
        completion_time: null,
        engagement_score: 0
      });

    const lesson = {
      id: record.id,
      ...record.fields
    };

    logger.logUserAction('lesson_created', user_id, {
      lesson_id,
      day,
      topic
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/lessons',
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson
 * @access  Public (should be protected in production)
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Remove fields that shouldn't be updated directly
    delete updateData.lesson_id;
    delete updateData.user_id;
    delete updateData.created_date;

    const record = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .update(id, updateData);

    const lesson = {
      id: record.id,
      ...record.fields
    };

    logger.logUserAction('lesson_updated', lesson.user_id, {
      lesson_id: lesson.lesson_id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/lessons/${id}`,
      method: 'PUT',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete lesson
 * @access  Public (should be protected in production)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const record = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .find(id);

    await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .destroy(id);

    logger.logUserAction('lesson_deleted', record.fields.user_id, {
      lesson_id: record.fields.lesson_id
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/lessons/${id}`,
      method: 'DELETE'
    });
    throw error;
  }
}));

/**
 * @route   POST /api/lessons/:id/complete
 * @desc    Mark lesson as completed
 * @access  Public (should be protected in production)
 */
router.post('/:id/complete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { engagement_score, completion_notes } = req.body;

  try {
    const record = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .update(id, {
        status: 'completed',
        completion_time: new Date().toISOString(),
        engagement_score: engagement_score || 0,
        completion_notes: completion_notes || ''
      });

    const lesson = {
      id: record.id,
      ...record.fields
    };

    // Update user's total sessions and last learning session
    const userRecords = await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
      .select({
        filterByFormula: `{user_id} = '${lesson.user_id}'`,
        maxRecords: 1
      })
      .all();

    if (userRecords.length > 0) {
      const userRecord = userRecords[0];
      const currentSessions = userRecord.fields.total_sessions || 0;
      
      await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
        .update(userRecord.id, {
          total_sessions: currentSessions + 1,
          last_learning_session: new Date().toISOString().split('T')[0]
        });
    }

    logger.logEngagement('lesson_completed', lesson.user_id, {
      lesson_id: lesson.lesson_id,
      day: lesson.day,
      engagement_score: engagement_score || 0
    });

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: lesson
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }
    
    logger.logError(error, {
      endpoint: `/api/lessons/${id}/complete`,
      method: 'POST',
      body: req.body
    });
    throw error;
  }
}));

/**
 * @route   GET /api/lessons/user/:user_id/current
 * @desc    Get current lesson for user (next pending lesson)
 * @access  Public (should be protected in production)
 */
router.get('/user/:user_id/current', asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  try {
    const records = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `AND({user_id} = '${user_id}', {status} = 'pending')`,
        sort: [{ field: 'day', direction: 'asc' }],
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      return res.json({
        success: true,
        message: 'No pending lessons found',
        data: null
      });
    }

    const lesson = {
      id: records[0].id,
      ...records[0].fields
    };

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: `/api/lessons/user/${user_id}/current`,
      method: 'GET'
    });
    throw error;
  }
}));

/**
 * @route   GET /api/lessons/user/:user_id/progress
 * @desc    Get learning progress for user
 * @access  Public (should be protected in production)
 */
router.get('/user/:user_id/progress', asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  try {
    const records = await base(process.env.AIRTABLE_LESSONS_TABLE || 'Lessons')
      .select({
        filterByFormula: `{user_id} = '${user_id}'`,
        sort: [{ field: 'day', direction: 'asc' }]
      })
      .all();

    const lessons = records.map(record => record.fields);
    const completedLessons = lessons.filter(lesson => lesson.status === 'completed');
    const pendingLessons = lessons.filter(lesson => lesson.status === 'pending');
    const totalLessons = lessons.length;
    
    const progress = {
      user_id,
      total_lessons: totalLessons,
      completed_lessons: completedLessons.length,
      pending_lessons: pendingLessons.length,
      completion_rate: totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0,
      current_day: Math.max(...lessons.map(l => l.day || 0), 0),
      next_lesson_day: pendingLessons.length > 0 ? Math.min(...pendingLessons.map(l => l.day)) : null,
      average_engagement: completedLessons.length > 0 
        ? Math.round(completedLessons.reduce((sum, l) => sum + (l.engagement_score || 0), 0) / completedLessons.length)
        : 0,
      lessons: lessons.map(lesson => ({
        day: lesson.day,
        topic: lesson.topic,
        status: lesson.status,
        completion_time: lesson.completion_time,
        engagement_score: lesson.engagement_score
      }))
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.logError(error, {
      endpoint: `/api/lessons/user/${user_id}/progress`,
      method: 'GET'
    });
    throw error;
  }
}));

module.exports = router;