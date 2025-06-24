// Database Tests
const path = require('path');

// Mock external dependencies
jest.mock('airtable');
jest.mock('googleapis');

// Import modules to test
const airtableSetup = require('../../../database/airtable/setup/airtable-setup');
const sheetsSetup = require('../../../database/google-sheets/setup/sheets-setup');
const fieldMappings = require('../../../database/airtable/config/field-mappings');
const sampleData = require('../../../database/airtable/setup/sample-data');

describe('Database Integration Tests', () => {
  describe('Airtable Integration', () => {
    let mockAirtableBase;
    
    beforeEach(() => {
      mockAirtableBase = {
        table: jest.fn().mockReturnThis(),
        create: jest.fn(),
        select: jest.fn().mockReturnThis(),
        firstPage: jest.fn(),
        destroy: jest.fn(),
        update: jest.fn()
      };
    });

    it('should complete full Airtable setup workflow', async () => {
      // Mock successful responses
      mockAirtableBase.firstPage.mockResolvedValue([
        { fields: { user_id: 'test', name: 'Test User', email: 'test@example.com' } }
      ]);
      mockAirtableBase.create.mockResolvedValue([
        { id: 'rec1', fields: { name: 'Test User 1' } },
        { id: 'rec2', fields: { name: 'Test User 2' } }
      ]);
      mockAirtableBase.destroy.mockResolvedValue([{ id: 'rec1' }, { id: 'rec2' }]);
      
      // Test connection
      const connectionResult = await airtableSetup.testConnection(mockAirtableBase);
      expect(connectionResult.success).toBe(true);
      
      // Create sample data
      const usersResult = await airtableSetup.createSampleData(mockAirtableBase, 'users');
      expect(usersResult.success).toBe(true);
      
      const lessonsResult = await airtableSetup.createSampleData(mockAirtableBase, 'lessons');
      expect(lessonsResult.success).toBe(true);
      
      // Verify structure
      const structureResult = await airtableSetup.verifyTableStructure(mockAirtableBase, 'Users');
      expect(structureResult.success).toBe(true);
      
      // Cleanup
      const cleanupResult = await airtableSetup.cleanupTestData(mockAirtableBase);
      expect(cleanupResult.success).toBe(true);
    });

    it('should handle Airtable connection failures gracefully', async () => {
      const error = new Error('Network error');
      mockAirtableBase.firstPage.mockRejectedValue(error);
      
      const result = await airtableSetup.testConnection(mockAirtableBase);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should validate data transformation between app and Airtable formats', () => {
      const appUserData = {
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        jobTitle: 'Developer'
      };
      
      // Transform to Airtable format
      const airtableData = fieldMappings.transformToAirtable(appUserData, 'Users');
      expect(airtableData.user_id).toBe('user-123');
      expect(airtableData.whatsapp).toBe('+1234567890');
      expect(airtableData.job_title).toBe('Developer');
      
      // Transform back to app format
      const transformedBack = fieldMappings.transformFromAirtable(airtableData, 'Users');
      expect(transformedBack).toEqual(appUserData);
    });

    it('should validate sample data integrity', () => {
      const users = sampleData.getSampleData('users');
      const lessons = sampleData.getSampleData('lessons');
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons.length).toBeGreaterThan(0);
      
      // Validate user data structure
      users.forEach(user => {
        expect(user).toHaveProperty('user_id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(typeof user.email).toBe('string');
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
      
      // Validate lesson data structure
      lessons.forEach(lesson => {
        expect(lesson).toHaveProperty('lesson_id');
        expect(lesson).toHaveProperty('title');
        expect(lesson).toHaveProperty('content_type');
        expect(lesson).toHaveProperty('duration');
        expect(typeof lesson.duration).toBe('number');
        expect(lesson.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Google Sheets Integration', () => {
    let mockSheetsService;
    
    beforeEach(() => {
      mockSheetsService = {
        spreadsheets: {
          values: {
            update: jest.fn(),
            get: jest.fn(),
            batchUpdate: jest.fn()
          },
          get: jest.fn(),
          batchUpdate: jest.fn()
        }
      };
    });

    it('should complete full Google Sheets setup workflow', async () => {
      const spreadsheetId = '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      
      // Mock successful responses
      mockSheetsService.spreadsheets.get.mockResolvedValue({
        data: {
          properties: { title: 'Test Spreadsheet' },
          sheets: [
            { properties: { title: 'Users' } },
            { properties: { title: 'Lessons' } },
            { properties: { title: 'Analytics' } },
            { properties: { title: 'Engagement' } }
          ]
        }
      });
      
      mockSheetsService.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 10 }
      });
      
      mockSheetsService.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['User ID', 'Name', 'Email'],
            ['user-1', 'Test User', 'test@example.com']
          ]
        }
      });
      
      // Test connection
      const connectionResult = await sheetsSetup.testConnection(mockSheetsService, spreadsheetId);
      expect(connectionResult.success).toBe(true);
      expect(connectionResult.sheetsFound).toContain('Users');
      expect(connectionResult.sheetsFound).toContain('Lessons');
      
      // Setup headers for all sheets
      const sheetTypes = ['Users', 'Lessons', 'Analytics', 'Engagement'];
      for (const sheetType of sheetTypes) {
        const headerResult = await sheetsSetup.setupHeaders(mockSheetsService, spreadsheetId, sheetType);
        expect(headerResult.success).toBe(true);
      }
      
      // Create sample data
      const dataResult = await sheetsSetup.createSampleData(mockSheetsService, spreadsheetId, 'Users');
      expect(dataResult.success).toBe(true);
      
      // Verify structure
      const structureResult = await sheetsSetup.verifySheetStructure(mockSheetsService, spreadsheetId, 'Users');
      expect(structureResult.success).toBe(true);
    });

    it('should handle Google Sheets API errors gracefully', async () => {
      const error = new Error('API quota exceeded');
      mockSheetsService.spreadsheets.get.mockRejectedValue(error);
      
      const result = await sheetsSetup.testConnection(mockSheetsService, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API quota exceeded');
    });

    it('should validate sheet header configurations', async () => {
      const spreadsheetId = '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      
      mockSheetsService.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 16 }
      });
      
      // Test Users sheet headers
      const usersResult = await sheetsSetup.setupHeaders(mockSheetsService, spreadsheetId, 'Users');
      expect(usersResult.success).toBe(true);
      
      const usersCall = mockSheetsService.spreadsheets.values.update.mock.calls.find(
        call => call[0].range.includes('Users')
      );
      expect(usersCall[0].resource.values[0]).toContain('User ID');
      expect(usersCall[0].resource.values[0]).toContain('Name');
      expect(usersCall[0].resource.values[0]).toContain('Email');
      
      // Test Lessons sheet headers
      const lessonsResult = await sheetsSetup.setupHeaders(mockSheetsService, spreadsheetId, 'Lessons');
      expect(lessonsResult.success).toBe(true);
      
      const lessonsCall = mockSheetsService.spreadsheets.values.update.mock.calls.find(
        call => call[0].range.includes('Lessons')
      );
      expect(lessonsCall[0].resource.values[0]).toContain('Lesson ID');
      expect(lessonsCall[0].resource.values[0]).toContain('Title');
      expect(lessonsCall[0].resource.values[0]).toContain('Content Type');
    });
  });

  describe('Cross-Platform Data Consistency', () => {
    it('should maintain data consistency between Airtable and Google Sheets', () => {
      // Get sample data
      const airtableUsers = sampleData.getSampleData('users');
      const airtableLessons = sampleData.getSampleData('lessons');
      
      // Validate that data can be transformed for both platforms
      airtableUsers.forEach(user => {
        // Transform to app format
        const appUser = fieldMappings.transformFromAirtable(user, 'Users');
        expect(appUser).toHaveProperty('userId');
        expect(appUser).toHaveProperty('name');
        expect(appUser).toHaveProperty('email');
        
        // Transform back to Airtable format
        const backToAirtable = fieldMappings.transformToAirtable(appUser, 'Users');
        expect(backToAirtable.user_id).toBe(user.user_id);
        expect(backToAirtable.name).toBe(user.name);
        expect(backToAirtable.email).toBe(user.email);
      });
      
      airtableLessons.forEach(lesson => {
        // Transform to app format
        const appLesson = fieldMappings.transformFromAirtable(lesson, 'Lessons');
        expect(appLesson).toHaveProperty('lessonId');
        expect(appLesson).toHaveProperty('title');
        expect(appLesson).toHaveProperty('contentType');
        
        // Transform back to Airtable format
        const backToAirtable = fieldMappings.transformToAirtable(appLesson, 'Lessons');
        expect(backToAirtable.lesson_id).toBe(lesson.lesson_id);
        expect(backToAirtable.title).toBe(lesson.title);
        expect(backToAirtable.content_type).toBe(lesson.content_type);
      });
    });

    it('should validate required fields across all table types', () => {
      const tableTypes = ['Users', 'Lessons', 'Analytics', 'Engagement'];
      
      tableTypes.forEach(tableType => {
        const requiredFields = fieldMappings.getRequiredFields(tableType);
        expect(Array.isArray(requiredFields)).toBe(true);
        expect(requiredFields.length).toBeGreaterThan(0);
        
        // Test validation with complete data
        const sampleRecord = sampleData.getSampleData(tableType.toLowerCase())[0];
        if (sampleRecord) {
          const validation = fieldMappings.validateRequiredFields(sampleRecord, tableType);
          expect(validation.isValid).toBe(true);
          expect(validation.missingFields).toEqual([]);
        }
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle partial setup failures gracefully', async () => {
      const mockBase = {
        table: jest.fn().mockReturnThis(),
        create: jest.fn(),
        select: jest.fn().mockReturnThis(),
        firstPage: jest.fn(),
        destroy: jest.fn()
      };
      
      // Simulate partial failure - connection works but data creation fails
      mockBase.firstPage.mockResolvedValue([{ fields: { name: 'test' } }]);
      mockBase.create.mockRejectedValue(new Error('Creation failed'));
      
      const connectionResult = await airtableSetup.testConnection(mockBase);
      expect(connectionResult.success).toBe(true);
      
      const dataResult = await airtableSetup.createSampleData(mockBase, 'users');
      expect(dataResult.success).toBe(false);
      expect(dataResult.error).toBe('Creation failed');
    });

    it('should validate data integrity after operations', () => {
      // Test with invalid data
      const invalidUserData = {
        user_id: 'user-123'
        // Missing required fields: name, email
      };
      
      const validation = fieldMappings.validateRequiredFields(invalidUserData, 'Users');
      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('name');
      expect(validation.missingFields).toContain('email');
    });

    it('should handle cleanup operations safely', async () => {
      const mockBase = {
        table: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        firstPage: jest.fn(),
        destroy: jest.fn()
      };
      
      // Mock test data records
      mockBase.firstPage.mockResolvedValue([
        { id: 'rec1', fields: { email: 'test1@example.com' } },
        { id: 'rec2', fields: { email: 'test2@example.com' } }
      ]);
      mockBase.destroy.mockResolvedValue([{ id: 'rec1' }, { id: 'rec2' }]);
      
      const result = await airtableSetup.cleanupTestData(mockBase);
      
      expect(result.success).toBe(true);
      expect(result.recordsDeleted).toBe(2);
      expect(mockBase.destroy).toHaveBeenCalledWith(['rec1', 'rec2']);
    });
  });
});
