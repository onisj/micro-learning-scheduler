/**
 * Field Mappings Configuration
 * Maps application field names to Airtable field names and handles data transformation
 */

/**
 * Users table field mappings
 */
const USERS_FIELD_MAPPING = {
  // Application field -> Airtable field
  userId: 'user_id',
  name: 'name',
  email: 'email',
  whatsapp: 'whatsapp',
  jobTitle: 'job_title',
  skillGaps: 'skill_gaps',
  learningFormat: 'learning_format',
  preferredTime: 'preferred_time',
  timezone: 'timezone',
  registrationDate: 'registration_date',
  lastLearningSession: 'last_learning_session',
  totalSessions: 'total_sessions',
  completionRate: 'completion_rate',
  status: 'status',
  calendarEmail: 'calendar_email',
  notificationPreferences: 'notification_preferences',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

/**
 * Lessons table field mappings
 */
const LESSONS_FIELD_MAPPING = {
  // Application field -> Airtable field
  lessonId: 'lesson_id',
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
  userFeedback: 'user_feedback',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

/**
 * Analytics table field mappings
 */
const ANALYTICS_FIELD_MAPPING = {
  // Application field -> Airtable field
  analyticsId: 'analytics_id',
  userId: 'user_id',
  date: 'date',
  lessonsDelivered: 'lessons_delivered',
  lessonsCompleted: 'lessons_completed',
  totalEngagementTime: 'total_engagement_time',
  averageEngagementScore: 'average_engagement_score',
  completionRate: 'completion_rate',
  preferredContentType: 'preferred_content_type',
  peakEngagementTime: 'peak_engagement_time',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

/**
 * Engagement table field mappings
 */
const ENGAGEMENT_FIELD_MAPPING = {
  // Application field -> Airtable field
  engagementId: 'engagement_id',
  userId: 'user_id',
  lessonId: 'lesson_id',
  interactionType: 'interaction_type',
  timestamp: 'timestamp',
  duration: 'duration',
  deviceType: 'device_type',
  location: 'location',
  sessionId: 'session_id',
  userAgent: 'user_agent',
  referrer: 'referrer',
  engagementScore: 'engagement_score',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

/**
 * Reverse mappings (Airtable field -> Application field)
 */
const REVERSE_USERS_MAPPING = Object.fromEntries(
  Object.entries(USERS_FIELD_MAPPING).map(([key, value]) => [value, key])
);

const REVERSE_LESSONS_MAPPING = Object.fromEntries(
  Object.entries(LESSONS_FIELD_MAPPING).map(([key, value]) => [value, key])
);

const REVERSE_ANALYTICS_MAPPING = Object.fromEntries(
  Object.entries(ANALYTICS_FIELD_MAPPING).map(([key, value]) => [value, key])
);

const REVERSE_ENGAGEMENT_MAPPING = Object.fromEntries(
  Object.entries(ENGAGEMENT_FIELD_MAPPING).map(([key, value]) => [value, key])
);

/**
 * Data transformation functions
 */
const DATA_TRANSFORMERS = {
  // Transform application data to Airtable format
  toAirtable: {
    users: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([appField, value]) => {
        const airtableField = USERS_FIELD_MAPPING[appField];
        if (airtableField) {
          // Handle array fields
          if (appField === 'skillGaps' || appField === 'notificationPreferences') {
            transformed[airtableField] = Array.isArray(value) ? value : [value];
          }
          // Handle date fields
          else if (appField === 'registrationDate' && value) {
            transformed[airtableField] = new Date(value).toISOString().split('T')[0];
          }
          // Handle datetime fields
          else if ((appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[airtableField] = new Date(value).toISOString();
          }
          // Handle numeric fields
          else if ((appField === 'totalSessions' || appField === 'completionRate') && value !== undefined) {
            transformed[airtableField] = Number(value);
          }
          else {
            transformed[airtableField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    lessons: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([appField, value]) => {
        const airtableField = LESSONS_FIELD_MAPPING[appField];
        if (airtableField) {
          // Handle array fields
          if (appField === 'keywords') {
            transformed[airtableField] = Array.isArray(value) ? value : [value];
          }
          // Handle date fields
          else if ((appField === 'createdDate' || appField === 'deliveryDate' || appField === 'completionDate') && value) {
            transformed[airtableField] = new Date(value).toISOString();
          }
          // Handle datetime fields
          else if ((appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[airtableField] = new Date(value).toISOString();
          }
          // Handle numeric fields
          else if ((appField === 'day' || appField === 'estimatedDuration' || appField === 'engagementScore') && value !== undefined) {
            transformed[airtableField] = Number(value);
          }
          else {
            transformed[airtableField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    analytics: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([appField, value]) => {
        const airtableField = ANALYTICS_FIELD_MAPPING[appField];
        if (airtableField) {
          // Handle date fields
          if (appField === 'date' && value) {
            transformed[airtableField] = new Date(value).toISOString().split('T')[0];
          }
          // Handle datetime fields
          else if ((appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[airtableField] = new Date(value).toISOString();
          }
          // Handle numeric fields
          else if ((appField === 'lessonsDelivered' || appField === 'lessonsCompleted' || 
                   appField === 'totalEngagementTime' || appField === 'averageEngagementScore' || 
                   appField === 'completionRate') && value !== undefined) {
            transformed[airtableField] = Number(value);
          }
          else {
            transformed[airtableField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    engagement: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([appField, value]) => {
        const airtableField = ENGAGEMENT_FIELD_MAPPING[appField];
        if (airtableField) {
          // Handle datetime fields
          if ((appField === 'timestamp' || appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[airtableField] = new Date(value).toISOString();
          }
          // Handle numeric fields
          else if ((appField === 'duration' || appField === 'engagementScore') && value !== undefined) {
            transformed[airtableField] = Number(value);
          }
          else {
            transformed[airtableField] = value;
          }
        }
      });
      
      return transformed;
    }
  },
  
  // Transform Airtable data to application format
  fromAirtable: {
    users: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([airtableField, value]) => {
        const appField = REVERSE_USERS_MAPPING[airtableField];
        if (appField) {
          // Handle array fields
          if (appField === 'skillGaps' || appField === 'notificationPreferences') {
            transformed[appField] = Array.isArray(value) ? value : (value ? [value] : []);
          }
          // Handle date fields
          else if (appField === 'registrationDate' && value) {
            transformed[appField] = new Date(value).toISOString().split('T')[0];
          }
          // Handle datetime fields
          else if ((appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[appField] = new Date(value).toISOString();
          }
          else {
            transformed[appField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    lessons: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([airtableField, value]) => {
        const appField = REVERSE_LESSONS_MAPPING[airtableField];
        if (appField) {
          // Handle array fields
          if (appField === 'keywords') {
            transformed[appField] = Array.isArray(value) ? value : (value ? [value] : []);
          }
          // Handle datetime fields
          else if ((appField === 'createdDate' || appField === 'deliveryDate' || 
                   appField === 'completionDate' || appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[appField] = new Date(value).toISOString();
          }
          else {
            transformed[appField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    analytics: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([airtableField, value]) => {
        const appField = REVERSE_ANALYTICS_MAPPING[airtableField];
        if (appField) {
          // Handle date fields
          if (appField === 'date' && value) {
            transformed[appField] = new Date(value).toISOString().split('T')[0];
          }
          // Handle datetime fields
          else if ((appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[appField] = new Date(value).toISOString();
          }
          else {
            transformed[appField] = value;
          }
        }
      });
      
      return transformed;
    },
    
    engagement: (data) => {
      const transformed = {};
      
      Object.entries(data).forEach(([airtableField, value]) => {
        const appField = REVERSE_ENGAGEMENT_MAPPING[airtableField];
        if (appField) {
          // Handle datetime fields
          if ((appField === 'timestamp' || appField === 'createdAt' || appField === 'updatedAt') && value) {
            transformed[appField] = new Date(value).toISOString();
          }
          else {
            transformed[appField] = value;
          }
        }
      });
      
      return transformed;
    }
  }
};

/**
 * Get field mapping for a specific table
 */
function getFieldMapping(tableName) {
  const mappings = {
    users: USERS_FIELD_MAPPING,
    lessons: LESSONS_FIELD_MAPPING,
    analytics: ANALYTICS_FIELD_MAPPING,
    engagement: ENGAGEMENT_FIELD_MAPPING
  };
  
  return mappings[tableName] || {};
}

/**
 * Get reverse field mapping for a specific table
 */
function getReverseFieldMapping(tableName) {
  const mappings = {
    users: REVERSE_USERS_MAPPING,
    lessons: REVERSE_LESSONS_MAPPING,
    analytics: REVERSE_ANALYTICS_MAPPING,
    engagement: REVERSE_ENGAGEMENT_MAPPING
  };
  
  return mappings[tableName] || {};
}

/**
 * Transform data to Airtable format
 */
function transformToAirtable(tableName, data) {
  const transformer = DATA_TRANSFORMERS.toAirtable[tableName];
  if (!transformer) {
    throw new Error(`No transformer found for table: ${tableName}`);
  }
  
  return transformer(data);
}

/**
 * Transform data from Airtable format
 */
function transformFromAirtable(tableName, data) {
  const transformer = DATA_TRANSFORMERS.fromAirtable[tableName];
  if (!transformer) {
    throw new Error(`No transformer found for table: ${tableName}`);
  }
  
  return transformer(data);
}

/**
 * Validate required fields for a table
 */
function validateRequiredFields(tableName, data) {
  const requiredFields = {
    users: ['user_id', 'name', 'email'],
    lessons: ['lesson_id', 'user_id', 'title'],
    analytics: ['analytics_id', 'user_id', 'date'],
    engagement: ['engagement_id', 'user_id', 'lesson_id', 'interaction_type']
  };
  
  const required = requiredFields[tableName] || [];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields for ${tableName}: ${missing.join(', ')}`);
  }
  
  return true;
}

module.exports = {
  USERS_FIELD_MAPPING,
  LESSONS_FIELD_MAPPING,
  ANALYTICS_FIELD_MAPPING,
  ENGAGEMENT_FIELD_MAPPING,
  REVERSE_USERS_MAPPING,
  REVERSE_LESSONS_MAPPING,
  REVERSE_ANALYTICS_MAPPING,
  REVERSE_ENGAGEMENT_MAPPING,
  DATA_TRANSFORMERS,
  getFieldMapping,
  getReverseFieldMapping,
  transformToAirtable,
  transformFromAirtable,
  validateRequiredFields
};
