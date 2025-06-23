// Validation Utils

/**
 * Validation Utilities
 * Input validation and data sanitization functions
 */

const validator = require('validator');
const logger = require('./logging-utils');

/**
 * User Validation Functions
 */
class UserValidation {
  /**
   * Validate user registration data
   */
  static validateRegistration(data) {
    const errors = [];
    const sanitized = {};

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else {
      const name = validator.escape(data.name.trim());
      if (name.length < 2 || name.length > 100) {
        errors.push('Name must be between 2 and 100 characters');
      } else {
        sanitized.name = name;
      }
    }

    // Email validation
    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else {
      const email = data.email.trim().toLowerCase();
      if (!validator.isEmail(email)) {
        errors.push('Email must be a valid email address');
      } else {
        sanitized.email = email;
      }
    }

    // Phone validation (optional)
    if (data.phone) {
      if (typeof data.phone !== 'string') {
        errors.push('Phone must be a string');
      } else {
        const phone = data.phone.trim();
        if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
          errors.push('Phone must be a valid phone number');
        } else {
          sanitized.phone = phone;
        }
      }
    }

    // Learning goals validation (optional)
    if (data.learning_goals) {
      if (typeof data.learning_goals !== 'string') {
        errors.push('Learning goals must be a string');
      } else {
        const goals = validator.escape(data.learning_goals.trim());
        if (goals.length > 500) {
          errors.push('Learning goals must be less than 500 characters');
        } else {
          sanitized.learning_goals = goals;
        }
      }
    }

    // Preferred time validation (optional)
    if (data.preferred_time) {
      if (typeof data.preferred_time !== 'string') {
        errors.push('Preferred time must be a string');
      } else {
        const time = data.preferred_time.trim();
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
          errors.push('Preferred time must be in HH:MM format (24-hour)');
        } else {
          sanitized.preferred_time = time;
        }
      }
    }

    // Timezone validation (optional)
    if (data.timezone) {
      if (typeof data.timezone !== 'string') {
        errors.push('Timezone must be a string');
      } else {
        const timezone = data.timezone.trim();
        try {
          Intl.DateTimeFormat(undefined, { timeZone: timezone });
          sanitized.timezone = timezone;
        } catch (error) {
          errors.push('Timezone must be a valid timezone identifier');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate user update data
   */
  static validateUpdate(data) {
    const errors = [];
    const sanitized = {};

    // Only validate provided fields
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.push('Name must be a string');
      } else {
        const name = validator.escape(data.name.trim());
        if (name.length < 2 || name.length > 100) {
          errors.push('Name must be between 2 and 100 characters');
        } else {
          sanitized.name = name;
        }
      }
    }

    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        errors.push('Email must be a string');
      } else {
        const email = data.email.trim().toLowerCase();
        if (!validator.isEmail(email)) {
          errors.push('Email must be a valid email address');
        } else {
          sanitized.email = email;
        }
      }
    }

    if (data.phone !== undefined) {
      if (data.phone === null || data.phone === '') {
        sanitized.phone = '';
      } else if (typeof data.phone !== 'string') {
        errors.push('Phone must be a string');
      } else {
        const phone = data.phone.trim();
        if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
          errors.push('Phone must be a valid phone number');
        } else {
          sanitized.phone = phone;
        }
      }
    }

    if (data.learning_goals !== undefined) {
      if (data.learning_goals === null || data.learning_goals === '') {
        sanitized.learning_goals = '';
      } else if (typeof data.learning_goals !== 'string') {
        errors.push('Learning goals must be a string');
      } else {
        const goals = validator.escape(data.learning_goals.trim());
        if (goals.length > 500) {
          errors.push('Learning goals must be less than 500 characters');
        } else {
          sanitized.learning_goals = goals;
        }
      }
    }

    if (data.preferred_time !== undefined) {
      if (typeof data.preferred_time !== 'string') {
        errors.push('Preferred time must be a string');
      } else {
        const time = data.preferred_time.trim();
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
          errors.push('Preferred time must be in HH:MM format (24-hour)');
        } else {
          sanitized.preferred_time = time;
        }
      }
    }

    if (data.timezone !== undefined) {
      if (typeof data.timezone !== 'string') {
        errors.push('Timezone must be a string');
      } else {
        const timezone = data.timezone.trim();
        try {
          Intl.DateTimeFormat(undefined, { timeZone: timezone });
          sanitized.timezone = timezone;
        } catch (error) {
          errors.push('Timezone must be a valid timezone identifier');
        }
      }
    }

    if (data.status !== undefined) {
      const validStatuses = ['active', 'inactive', 'paused'];
      if (!validStatuses.includes(data.status)) {
        errors.push('Status must be one of: active, inactive, paused');
      } else {
        sanitized.status = data.status;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }
}

/**
 * Lesson Validation Functions
 */
class LessonValidation {
  /**
   * Validate lesson creation data
   */
  static validateCreation(data) {
    const errors = [];
    const sanitized = {};

    // User ID validation
    if (!data.user_id || typeof data.user_id !== 'string') {
      errors.push('User ID is required and must be a string');
    } else {
      sanitized.user_id = data.user_id.trim();
    }

    // Topic validation
    if (!data.topic || typeof data.topic !== 'string') {
      errors.push('Topic is required and must be a string');
    } else {
      const topic = validator.escape(data.topic.trim());
      if (topic.length < 2 || topic.length > 100) {
        errors.push('Topic must be between 2 and 100 characters');
      } else {
        sanitized.topic = topic;
      }
    }

    // Content validation
    if (!data.content || typeof data.content !== 'string') {
      errors.push('Content is required and must be a string');
    } else {
      const content = data.content.trim();
      if (content.length < 10 || content.length > 2000) {
        errors.push('Content must be between 10 and 2000 characters');
      } else {
        sanitized.content = content;
      }
    }

    // Day validation
    if (data.day !== undefined) {
      if (typeof data.day !== 'number' || !Number.isInteger(data.day) || data.day < 1) {
        errors.push('Day must be a positive integer');
      } else {
        sanitized.day = data.day;
      }
    }

    // Difficulty validation (optional)
    if (data.difficulty !== undefined) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(data.difficulty)) {
        errors.push('Difficulty must be one of: beginner, intermediate, advanced');
      } else {
        sanitized.difficulty = data.difficulty;
      }
    }

    // Format validation (optional)
    if (data.format !== undefined) {
      const validFormats = ['text', 'video', 'audio', 'interactive', 'quiz'];
      if (!validFormats.includes(data.format)) {
        errors.push('Format must be one of: text, video, audio, interactive, quiz');
      } else {
        sanitized.format = data.format;
      }
    }

    // Estimated duration validation (optional)
    if (data.estimated_duration !== undefined) {
      if (typeof data.estimated_duration !== 'number' || data.estimated_duration < 1 || data.estimated_duration > 30) {
        errors.push('Estimated duration must be a number between 1 and 30 minutes');
      } else {
        sanitized.estimated_duration = data.estimated_duration;
      }
    }

    // Quiz questions validation (optional)
    if (data.quiz_questions !== undefined) {
      if (typeof data.quiz_questions !== 'string') {
        errors.push('Quiz questions must be a string');
      } else {
        const questions = data.quiz_questions.trim();
        if (questions.length > 1000) {
          errors.push('Quiz questions must be less than 1000 characters');
        } else {
          sanitized.quiz_questions = questions;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate lesson completion data
   */
  static validateCompletion(data) {
    const errors = [];
    const sanitized = {};

    // Duration validation (optional)
    if (data.duration_minutes !== undefined) {
      if (typeof data.duration_minutes !== 'number' || data.duration_minutes < 0 || data.duration_minutes > 60) {
        errors.push('Duration must be a number between 0 and 60 minutes');
      } else {
        sanitized.duration_minutes = data.duration_minutes;
      }
    }

    // Quiz score validation (optional)
    if (data.quiz_score !== undefined) {
      if (typeof data.quiz_score !== 'number' || data.quiz_score < 0 || data.quiz_score > 100) {
        errors.push('Quiz score must be a number between 0 and 100');
      } else {
        sanitized.quiz_score = data.quiz_score;
      }
    }

    // Feedback validation (optional)
    if (data.feedback !== undefined) {
      if (typeof data.feedback !== 'string') {
        errors.push('Feedback must be a string');
      } else {
        const feedback = validator.escape(data.feedback.trim());
        if (feedback.length > 500) {
          errors.push('Feedback must be less than 500 characters');
        } else {
          sanitized.feedback = feedback;
        }
      }
    }

    // Completion time validation (optional)
    if (data.completion_time !== undefined) {
      if (typeof data.completion_time !== 'string') {
        errors.push('Completion time must be a string');
      } else {
        const time = data.completion_time.trim();
        if (!validator.isISO8601(time)) {
          errors.push('Completion time must be a valid ISO 8601 date string');
        } else {
          sanitized.completion_time = time;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }
}

/**
 * Engagement Validation Functions
 */
class EngagementValidation {
  /**
   * Validate engagement tracking data
   */
  static validateTracking(data) {
    const errors = [];
    const sanitized = {};

    // User ID validation
    if (!data.user_id || typeof data.user_id !== 'string') {
      errors.push('User ID is required and must be a string');
    } else {
      sanitized.user_id = data.user_id.trim();
    }

    // Event type validation
    if (!data.event_type || typeof data.event_type !== 'string') {
      errors.push('Event type is required and must be a string');
    } else {
      const validEventTypes = [
        'lesson_start', 'lesson_complete', 'lesson_pause', 'lesson_resume',
        'quiz_start', 'quiz_complete', 'feedback_submit', 'page_view',
        'button_click', 'video_play', 'video_pause', 'audio_play', 'audio_pause'
      ];
      if (!validEventTypes.includes(data.event_type)) {
        errors.push(`Event type must be one of: ${validEventTypes.join(', ')}`);
      } else {
        sanitized.event_type = data.event_type;
      }
    }

    // Event data validation (optional)
    if (data.event_data !== undefined) {
      if (typeof data.event_data !== 'object' || data.event_data === null) {
        errors.push('Event data must be an object');
      } else {
        try {
          // Validate that it can be stringified
          JSON.stringify(data.event_data);
          sanitized.event_data = data.event_data;
        } catch (error) {
          errors.push('Event data must be a valid JSON object');
        }
      }
    }

    // Timestamp validation (optional)
    if (data.timestamp !== undefined) {
      if (typeof data.timestamp !== 'string') {
        errors.push('Timestamp must be a string');
      } else {
        if (!validator.isISO8601(data.timestamp)) {
          errors.push('Timestamp must be a valid ISO 8601 date string');
        } else {
          sanitized.timestamp = data.timestamp;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }
}

/**
 * General Validation Functions
 */
class GeneralValidation {
  /**
   * Validate pagination parameters
   */
  static validatePagination(query) {
    const errors = [];
    const sanitized = {};

    // Page validation
    if (query.page !== undefined) {
      const page = parseInt(query.page);
      if (isNaN(page) || page < 1) {
        errors.push('Page must be a positive integer');
      } else {
        sanitized.page = page;
      }
    } else {
      sanitized.page = 1;
    }

    // Limit validation
    if (query.limit !== undefined) {
      const limit = parseInt(query.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        errors.push('Limit must be a positive integer between 1 and 100');
      } else {
        sanitized.limit = limit;
      }
    } else {
      sanitized.limit = 10;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate date range parameters
   */
  static validateDateRange(query) {
    const errors = [];
    const sanitized = {};

    // Start date validation
    if (query.start_date !== undefined) {
      if (typeof query.start_date !== 'string') {
        errors.push('Start date must be a string');
      } else {
        if (!validator.isDate(query.start_date)) {
          errors.push('Start date must be a valid date (YYYY-MM-DD)');
        } else {
          sanitized.start_date = query.start_date;
        }
      }
    }

    // End date validation
    if (query.end_date !== undefined) {
      if (typeof query.end_date !== 'string') {
        errors.push('End date must be a string');
      } else {
        if (!validator.isDate(query.end_date)) {
          errors.push('End date must be a valid date (YYYY-MM-DD)');
        } else {
          sanitized.end_date = query.end_date;
        }
      }
    }

    // Validate date range logic
    if (sanitized.start_date && sanitized.end_date) {
      const startDate = new Date(sanitized.start_date);
      const endDate = new Date(sanitized.end_date);
      if (startDate > endDate) {
        errors.push('Start date must be before or equal to end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(content) {
    if (typeof content !== 'string') {
      return '';
    }
    return validator.escape(content.trim());
  }

  /**
   * Validate and sanitize search query
   */
  static validateSearchQuery(query) {
    const errors = [];
    const sanitized = {};

    if (query.q !== undefined) {
      if (typeof query.q !== 'string') {
        errors.push('Search query must be a string');
      } else {
        const searchQuery = query.q.trim();
        if (searchQuery.length < 2) {
          errors.push('Search query must be at least 2 characters long');
        } else if (searchQuery.length > 100) {
          errors.push('Search query must be less than 100 characters');
        } else {
          sanitized.q = validator.escape(searchQuery);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }
}

/**
 * Validation Middleware Factory
 */
function createValidationMiddleware(validationFunction) {
  return (req, res, next) => {
    try {
      const validation = validationFunction(req.body);
      
      if (!validation.isValid) {
        logger.logError(new Error('Validation failed'), {
          endpoint: req.originalUrl,
          method: req.method,
          errors: validation.errors,
          body: req.body
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }
      
      // Replace request body with sanitized data
      req.body = validation.sanitized;
      next();
    } catch (error) {
      logger.logError(error, {
        context: 'Validation middleware error',
        endpoint: req.originalUrl,
        method: req.method
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
    }
  };
}

module.exports = {
  UserValidation,
  LessonValidation,
  EngagementValidation,
  GeneralValidation,
  createValidationMiddleware
};
