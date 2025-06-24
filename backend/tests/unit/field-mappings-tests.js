// Import the module to test
const {
  USERS_FIELD_MAPPING,
  LESSONS_FIELD_MAPPING,
  ANALYTICS_FIELD_MAPPING,
  ENGAGEMENT_FIELD_MAPPING,
  getFieldMapping,
  transformToAirtable,
  transformFromAirtable,
  validateRequiredFields
} = require('../../../database/airtable/config/field-mappings');

describe('Field Mappings Tests', () => {
  describe('Field Mapping Constants', () => {
    it('should have correct Users field mapping structure', () => {
      expect(USERS_FIELD_MAPPING).toBeDefined();
      
      // Check key mappings
      expect(USERS_FIELD_MAPPING.userId).toBe('user_id');
      expect(USERS_FIELD_MAPPING.name).toBe('name');
      expect(USERS_FIELD_MAPPING.email).toBe('email');
      expect(USERS_FIELD_MAPPING.skillGaps).toBe('skill_gaps');
    });

    it('should have correct Lessons field mapping structure', () => {
      expect(LESSONS_FIELD_MAPPING).toBeDefined();
      
      // Check key mappings
      expect(LESSONS_FIELD_MAPPING.lessonId).toBe('lesson_id');
      expect(LESSONS_FIELD_MAPPING.title).toBe('title');
      expect(LESSONS_FIELD_MAPPING.contentType).toBe('content_type');
      expect(LESSONS_FIELD_MAPPING.userId).toBe('user_id');
    });

    it('should have correct Analytics field mapping structure', () => {
      expect(ANALYTICS_FIELD_MAPPING).toBeDefined();
      expect(ANALYTICS_FIELD_MAPPING.analyticsId).toBe('analytics_id');
      expect(ANALYTICS_FIELD_MAPPING.userId).toBe('user_id');
      expect(ANALYTICS_FIELD_MAPPING.lessonsDelivered).toBe('lessons_delivered');
    });

    it('should have correct Engagement field mapping structure', () => {
      expect(ENGAGEMENT_FIELD_MAPPING).toBeDefined();
      expect(ENGAGEMENT_FIELD_MAPPING.appToAirtable.engagementId).toBe('engagement_id');
      expect(ENGAGEMENT_FIELD_MAPPING.appToAirtable.interactionType).toBe('interaction_type');
      expect(ENGAGEMENT_FIELD_MAPPING.appToAirtable.timestamp).toBe('timestamp');
    });
  });

  describe('getFieldMapping', () => {
    it('should return correct mapping for Users table', () => {
      const mapping = getFieldMapping('Users');
      expect(mapping).toEqual(USERS_FIELD_MAPPING);
    });

    it('should return correct mapping for Lessons table', () => {
      const mapping = getFieldMapping('Lessons');
      expect(mapping).toEqual(LESSONS_FIELD_MAPPING);
    });

    it('should return correct mapping for Analytics table', () => {
      const mapping = getFieldMapping('Analytics');
      expect(mapping).toEqual(ANALYTICS_FIELD_MAPPING);
    });

    it('should return correct mapping for Engagement table', () => {
      const mapping = getFieldMapping('Engagement');
      expect(mapping).toEqual(ENGAGEMENT_FIELD_MAPPING);
    });

    it('should throw error for invalid table name', () => {
      expect(() => {
        getFieldMapping('InvalidTable');
      }).toThrow('No field mapping found for table: InvalidTable');
    });
  });

  describe('transformToAirtable', () => {
    it('should transform Users data to Airtable format', () => {
      const appData = {
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        jobTitle: 'Developer'
      };
      
      const transformed = transformToAirtable(appData, 'Users');
      
      expect(transformed).toEqual({
        user_id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        whatsapp: '+1234567890',
        job_title: 'Developer'
      });
    });

    it('should transform Lessons data to Airtable format', () => {
      const appData = {
        lessonId: 'lesson-456',
        title: 'JavaScript Basics',
        contentType: 'article',
        duration: 5,
        difficultyLevel: 'beginner'
      };
      
      const transformed = transformToAirtable(appData, 'Lessons');
      
      expect(transformed).toEqual({
        lesson_id: 'lesson-456',
        title: 'JavaScript Basics',
        content_type: 'article',
        duration: 5,
        difficulty_level: 'beginner'
      });
    });

    it('should handle missing fields gracefully', () => {
      const appData = {
        userId: 'user-123',
        name: 'John Doe'
        // Missing email and other fields
      };
      
      const transformed = transformToAirtable(appData, 'Users');
      
      expect(transformed).toEqual({
        user_id: 'user-123',
        name: 'John Doe'
      });
    });

    it('should handle unmapped fields', () => {
      const appData = {
        userId: 'user-123',
        name: 'John Doe',
        unmappedField: 'should be ignored'
      };
      
      const transformed = transformToAirtable(appData, 'Users');
      
      expect(transformed).toEqual({
        user_id: 'user-123',
        name: 'John Doe'
      });
      expect(transformed.unmappedField).toBeUndefined();
    });
  });

  describe('transformFromAirtable', () => {
    it('should transform Users data from Airtable format', () => {
      const airtableData = {
        user_id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        whatsapp: '+1234567890',
        job_title: 'Developer'
      };
      
      const transformed = transformFromAirtable(airtableData, 'Users');
      
      expect(transformed).toEqual({
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        jobTitle: 'Developer'
      });
    });

    it('should transform Lessons data from Airtable format', () => {
      const airtableData = {
        lesson_id: 'lesson-456',
        title: 'JavaScript Basics',
        content_type: 'article',
        duration: 5,
        difficulty_level: 'beginner'
      };
      
      const transformed = transformFromAirtable(airtableData, 'Lessons');
      
      expect(transformed).toEqual({
        lessonId: 'lesson-456',
        title: 'JavaScript Basics',
        contentType: 'article',
        duration: 5,
        difficultyLevel: 'beginner'
      });
    });

    it('should handle array data transformation', () => {
      const airtableDataArray = [
        {
          user_id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        {
          user_id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      ];
      
      const transformed = transformFromAirtable(airtableDataArray, 'Users');
      
      expect(Array.isArray(transformed)).toBe(true);
      expect(transformed).toHaveLength(2);
      expect(transformed[0]).toEqual({
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(transformed[1]).toEqual({
        userId: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com'
      });
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate Users required fields successfully', () => {
      const validData = {
        user_id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const result = validateRequiredFields(validData, 'Users');
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('should identify missing required fields for Users', () => {
      const invalidData = {
        user_id: 'user-123'
        // Missing name and email
      };
      
      const result = validateRequiredFields(invalidData, 'Users');
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('name');
      expect(result.missingFields).toContain('email');
    });

    it('should validate Lessons required fields successfully', () => {
      const validData = {
        lesson_id: 'lesson-456',
        title: 'JavaScript Basics',
        content_type: 'article',
        duration: 5
      };
      
      const result = validateRequiredFields(validData, 'Lessons');
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('should identify missing required fields for Lessons', () => {
      const invalidData = {
        lesson_id: 'lesson-456'
        // Missing title, content_type, duration
      };
      
      const result = validateRequiredFields(invalidData, 'Lessons');
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('title');
      expect(result.missingFields).toContain('content_type');
      expect(result.missingFields).toContain('duration');
    });

    it('should handle empty data object', () => {
      const result = validateRequiredFields({}, 'Users');
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields.length).toBeGreaterThan(0);
    });

    it('should handle null/undefined data', () => {
      const resultNull = validateRequiredFields(null, 'Users');
      const resultUndefined = validateRequiredFields(undefined, 'Users');
      
      expect(resultNull.isValid).toBe(false);
      expect(resultUndefined.isValid).toBe(false);
    });
  });

  describe('getRequiredFields', () => {
    it('should return required fields for Users table', () => {
      const requiredFields = getRequiredFields('Users');
      
      expect(Array.isArray(requiredFields)).toBe(true);
      expect(requiredFields).toContain('user_id');
      expect(requiredFields).toContain('name');
      expect(requiredFields).toContain('email');
    });

    it('should return required fields for Lessons table', () => {
      const requiredFields = getRequiredFields('Lessons');
      
      expect(Array.isArray(requiredFields)).toBe(true);
      expect(requiredFields).toContain('lesson_id');
      expect(requiredFields).toContain('title');
      expect(requiredFields).toContain('content_type');
      expect(requiredFields).toContain('duration');
    });

    it('should return required fields for Analytics table', () => {
      const requiredFields = getRequiredFields('Analytics');
      
      expect(Array.isArray(requiredFields)).toBe(true);
      expect(requiredFields).toContain('analytics_id');
      expect(requiredFields).toContain('user_id');
      expect(requiredFields).toContain('date');
    });

    it('should return required fields for Engagement table', () => {
      const requiredFields = getRequiredFields('Engagement');
      
      expect(Array.isArray(requiredFields)).toBe(true);
      expect(requiredFields).toContain('engagement_id');
      expect(requiredFields).toContain('user_id');
      expect(requiredFields).toContain('lesson_id');
      expect(requiredFields).toContain('interaction_type');
    });

    it('should throw error for invalid table name', () => {
      expect(() => {
        getRequiredFields('InvalidTable');
      }).toThrow('No field mapping found for table: InvalidTable');
    });
  });
});

// Integration tests for field mappings
describe('Field Mappings Integration Tests', () => {
  it('should handle complete user data transformation cycle', () => {
    const originalAppData = {
      userId: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      whatsappNumber: '+1234567890',
      jobTitle: 'Developer',
      skillGaps: ['JavaScript', 'React'],
      learningGoals: ['Master frontend development'],
      preferredFormat: 'video',
      availability: 'morning',
      timezone: 'UTC-5',
      language: 'English',
      experienceLevel: 'intermediate',
      industry: 'Technology',
      department: 'Engineering'
    };
    
    // Transform to Airtable format
    const airtableData = transformToAirtable(originalAppData, 'Users');
    
    // Validate required fields
    const validation = validateRequiredFields(airtableData, 'Users');
    expect(validation.isValid).toBe(true);
    
    // Transform back to app format
    const transformedBackData = transformFromAirtable(airtableData, 'Users');
    
    // Should match original data
    expect(transformedBackData).toEqual(originalAppData);
  });

  it('should handle complete lesson data transformation cycle', () => {
    const originalAppData = {
      lessonId: 'lesson-456',
      title: 'JavaScript Basics',
      description: 'Learn the fundamentals of JavaScript',
      content: 'JavaScript is a programming language...',
      contentType: 'article',
      duration: 5,
      difficultyLevel: 'beginner',
      tags: ['javascript', 'programming', 'basics'],
      prerequisites: [],
      learningObjectives: ['Understand variables', 'Learn functions'],
      category: 'Programming',
      subcategory: 'Frontend',
      language: 'English',
      authorId: 'author-123',
      status: 'published',
      version: '1.0'
    };
    
    // Transform to Airtable format
    const airtableData = transformToAirtable(originalAppData, 'Lessons');
    
    // Validate required fields
    const validation = validateRequiredFields(airtableData, 'Lessons');
    expect(validation.isValid).toBe(true);
    
    // Transform back to app format
    const transformedBackData = transformFromAirtable(airtableData, 'Lessons');
    
    // Should match original data
    expect(transformedBackData).toEqual(originalAppData);
  });
});