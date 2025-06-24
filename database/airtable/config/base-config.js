// Base Config

/**
 * Airtable Base Configuration
 * Defines the base structure and connection settings for the micro-learning scheduler
 */

require('dotenv').config();

const BASE_CONFIG = {
  // Base identification
  baseId: process.env.AIRTABLE_BASE_ID || 'appXXXXXXXXXXXXXX', // Placeholder base ID
  apiKey: process.env.AIRTABLE_API_KEY,
  
  // Table names
  tables: {
    users: process.env.AIRTABLE_USERS_TABLE || 'Users',
    lessons: process.env.AIRTABLE_LESSONS_TABLE || 'Lessons',
    analytics: process.env.AIRTABLE_ANALYTICS_TABLE || 'Analytics',
    engagement: process.env.AIRTABLE_ENGAGEMENT_TABLE || 'Engagement'
  },
  
  // API configuration
  api: {
    requestsPerSecond: 5, // Airtable rate limit
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    timeout: 30000 // 30 seconds
  },
  
  // Field mappings for easier access
  fieldMappings: {
    users: {
      id: 'user_id',
      name: 'name',
      email: 'email',
      phone: 'whatsapp',
      jobTitle: 'job_title',
      skillGaps: 'skill_gaps',
      learningFormat: 'learning_format',
      preferredTime: 'preferred_time',
      timezone: 'timezone',
      registrationDate: 'registration_date',
      lastSession: 'last_learning_session',
      totalSessions: 'total_sessions',
      completionRate: 'completion_rate',
      status: 'status',
      calendarEmail: 'calendar_email',
      notificationPrefs: 'notification_preferences'
    },
    lessons: {
      id: 'lesson_id',
      userId: 'user_id',
      day: 'day',
      title: 'title',
      contentType: 'content_type',
      description: 'description',
      keywords: 'keywords',
      difficultyLevel: 'difficulty_level',
      estimatedDuration: 'estimated_duration',
      status: 'status',
      createdDate: 'created_date',
      deliveryDate: 'delivery_date',
      completionDate: 'completion_date',
      deliveryMethod: 'delivery_method',
      engagementScore: 'engagement_score',
      userFeedback: 'user_feedback'
    }
  },
  
  // Validation rules
  validation: {
    users: {
      required: ['user_id', 'name', 'email'],
      email: ['email', 'calendar_email'],
      phone: ['whatsapp'],
      maxLength: {
        name: 100,
        job_title: 100,
        user_id: 50
      }
    },
    lessons: {
      required: ['lesson_id', 'user_id', 'title', 'day'],
      numeric: ['day', 'estimated_duration', 'engagement_score'],
      ranges: {
        day: { min: 1, max: 30 },
        estimated_duration: { min: 1, max: 60 },
        engagement_score: { min: 0, max: 100 }
      }
    }
  },
  
  // Default values
  defaults: {
    users: {
      status: 'active',
      total_sessions: 0,
      completion_rate: 0,
      learning_format: 'Mixed',
      preferred_time: 'Morning',
      timezone: 'UTC',
      notification_preferences: ['Email']
    },
    lessons: {
      status: 'pending',
      estimated_duration: 5,
      engagement_score: 0,
      difficulty_level: 'Beginner'
    }
  }
};

// Validation functions
const validateConfig = () => {
  const errors = [];
  
  if (!BASE_CONFIG.apiKey) {
    errors.push('AIRTABLE_API_KEY environment variable is required');
  }
  
  if (!BASE_CONFIG.baseId || BASE_CONFIG.baseId === 'appXXXXXXXXXXXXXX') {
    console.warn('Warning: Using placeholder Airtable Base ID. Please set AIRTABLE_BASE_ID environment variable.');
  }
  
  if (errors.length > 0) {
    throw new Error(`Airtable configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
};

// Helper functions
const getTableName = (tableKey) => {
  return BASE_CONFIG.tables[tableKey] || tableKey;
};

const getFieldMapping = (table, field) => {
  return BASE_CONFIG.fieldMappings[table]?.[field] || field;
};

const getDefaultValue = (table, field) => {
  return BASE_CONFIG.defaults[table]?.[field];
};

const validateRecord = (table, record) => {
  const validation = BASE_CONFIG.validation[table];
  if (!validation) return { valid: true };
  
  const errors = [];
  
  // Check required fields
  if (validation.required) {
    validation.required.forEach(field => {
      if (!record[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }
  
  // Check field lengths
  if (validation.maxLength) {
    Object.entries(validation.maxLength).forEach(([field, maxLen]) => {
      if (record[field] && record[field].length > maxLen) {
        errors.push(`Field ${field} exceeds maximum length of ${maxLen}`);
      }
    });
  }
  
  // Check numeric ranges
  if (validation.ranges) {
    Object.entries(validation.ranges).forEach(([field, range]) => {
      const value = record[field];
      if (value !== undefined && value !== null) {
        if (value < range.min || value > range.max) {
          errors.push(`Field ${field} must be between ${range.min} and ${range.max}`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  BASE_CONFIG,
  validateConfig,
  getTableName,
  getFieldMapping,
  getDefaultValue,
  validateRecord
};
