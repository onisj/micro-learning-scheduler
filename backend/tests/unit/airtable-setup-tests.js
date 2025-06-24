// Mock Airtable module
jest.mock('airtable', () => {
  const mockBase = {
    table: jest.fn().mockReturnThis(),
    create: jest.fn(),
    select: jest.fn().mockReturnThis(),
    firstPage: jest.fn(),
    destroy: jest.fn()
  };

  return jest.fn().mockImplementation(() => ({
    base: jest.fn(() => mockBase)
  }));
});

// Import the module to test
const {
  initializeAirtable,
  testConnection,
  createSampleData,
  verifyTableStructure,
  cleanupTestData
} = require('../../../database/airtable/setup/airtable-setup');

const Airtable = require('airtable');

describe('Airtable Setup Tests', () => {
  let mockBase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBase = {
      table: jest.fn().mockReturnThis(),
      create: jest.fn(),
      select: jest.fn().mockReturnThis(),
      firstPage: jest.fn(),
      destroy: jest.fn()
    };
    Airtable.mockImplementation(() => ({
      base: jest.fn(() => mockBase)
    }));
  });

  describe('initializeAirtable', () => {
    it('should initialize Airtable with correct configuration', () => {
      const config = {
        apiKey: 'test-api-key',
        baseId: 'appXXXXXXXXXXXXXX'
      };

      const result = initializeAirtable(config);
      expect(result).toBeDefined();
      expect(Airtable).toHaveBeenCalledWith({
        apiKey: config.apiKey
      });
    });
  });

  describe('testConnection', () => {
    it('should test Airtable connection successfully', async () => {
      mockBase.select.mockReturnValue({
        firstPage: jest.fn().mockResolvedValue([])
      });

      const result = await testConnection();
      expect(result).toBe(true);
    });
  });

  describe('createSampleData', () => {
    it('should create sample data in Airtable', async () => {
      mockBase.create.mockResolvedValue([{ id: 'rec123' }]);

      const result = await createSampleData();
      expect(result).toBeDefined();
      expect(mockBase.create).toHaveBeenCalled();
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        initializeAirtable({ baseId: 'appXXXXXXXXXXXXXX' });
      }).toThrow('API key is required');
    });

    it('should throw error when baseId is missing', () => {
      expect(() => {
        initializeAirtable({ apiKey: 'test-api-key' });
      }).toThrow('Base ID is required');
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection', async () => {
      mockBase.firstPage.mockResolvedValue([]);

      const result = await testConnection(mockBase);

      expect(mockBase.table).toHaveBeenCalledWith('Users');
      expect(mockBase.select).toHaveBeenCalledWith({ maxRecords: 1 });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection successful');
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockBase.firstPage.mockRejectedValue(error);

      const result = await testConnection(mockBase);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('createSampleData', () => {
    it('should create sample users successfully', async () => {
      const mockUsers = [
        { id: 'rec1', fields: { name: 'John Doe', email: 'john@example.com' } },
        { id: 'rec2', fields: { name: 'Jane Smith', email: 'jane@example.com' } }
      ];

      mockBase.create.mockResolvedValue(mockUsers);

      const result = await createSampleData(mockBase, 'users');

      expect(mockBase.table).toHaveBeenCalledWith('Users');
      expect(mockBase.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.recordsCreated).toBe(2);
    });

    it('should create sample lessons successfully', async () => {
      const mockLessons = [
        { id: 'rec3', fields: { title: 'JavaScript Basics', duration: 5 } },
        { id: 'rec4', fields: { title: 'React Fundamentals', duration: 7 } }
      ];

      mockBase.create.mockResolvedValue(mockLessons);

      const result = await createSampleData(mockBase, 'lessons');

      expect(mockBase.table).toHaveBeenCalledWith('Lessons');
      expect(result.success).toBe(true);
      expect(result.recordsCreated).toBe(2);
    });

    it('should handle invalid data type', async () => {
      const result = await createSampleData(mockBase, 'invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid data type: invalid');
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockBase.create.mockRejectedValue(error);

      const result = await createSampleData(mockBase, 'users');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('verifyTableStructure', () => {
    it('should verify Users table structure', async () => {
      const mockRecord = {
        fields: {
          user_id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          whatsapp: '+1234567890',
          job_title: 'Developer'
        }
      };

      mockBase.firstPage.mockResolvedValue([mockRecord]);

      const result = await verifyTableStructure(mockBase, 'Users');

      expect(result.success).toBe(true);
      expect(result.fieldsFound).toContain('user_id');
      expect(result.fieldsFound).toContain('name');
      expect(result.fieldsFound).toContain('email');
    });

    it('should verify Lessons table structure', async () => {
      const mockRecord = {
        fields: {
          lesson_id: 'lesson-1',
          title: 'Test Lesson',
          content_type: 'article',
          duration: 5
        }
      };

      mockBase.firstPage.mockResolvedValue([mockRecord]);

      const result = await verifyTableStructure(mockBase, 'Lessons');

      expect(result.success).toBe(true);
      expect(result.fieldsFound).toContain('lesson_id');
      expect(result.fieldsFound).toContain('title');
    });

    it('should handle empty table', async () => {
      mockBase.firstPage.mockResolvedValue([]);

      const result = await verifyTableStructure(mockBase, 'Users');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No records found to verify structure');
    });
  });

  describe('cleanupTestData', () => {
    it('should cleanup test records successfully', async () => {
      const mockRecords = [
        { id: 'rec1', fields: { email: 'test1@example.com' } },
        { id: 'rec2', fields: { email: 'test2@example.com' } }
      ];

      mockBase.firstPage.mockResolvedValue(mockRecords);
      mockBase.destroy.mockResolvedValue([{ id: 'rec1' }, { id: 'rec2' }]);

      const result = await cleanupTestData(mockBase);

      expect(result.success).toBe(true);
      expect(result.recordsDeleted).toBe(2);
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Cleanup failed');
      mockBase.firstPage.mockRejectedValue(error);

      const result = await cleanupTestData(mockBase);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cleanup failed');
    });
  });

  // Integration test for full setup process
  describe('Airtable Setup Integration', () => {
    it('should complete full setup process', async () => {
      const localMockBase = {
        table: jest.fn().mockReturnThis(),
        create: jest.fn().mockResolvedValue([{ id: 'rec1' }]),
        select: jest.fn().mockReturnThis(),
        firstPage: jest.fn().mockResolvedValue([{ fields: { name: 'test' } }]),
        destroy: jest.fn().mockResolvedValue([{ id: 'rec1' }])
      };

      // Test connection
      const connectionResult = await testConnection(localMockBase);
      expect(connectionResult.success).toBe(true);

      // Create sample data
      const usersResult = await createSampleData(localMockBase, 'users');
      expect(usersResult.success).toBe(true);

      const lessonsResult = await createSampleData(localMockBase, 'lessons');
      expect(lessonsResult.success).toBe(true);

      // Verify structure
      const structureResult = await verifyTableStructure(localMockBase, 'Users');
      expect(structureResult.success).toBe(true);

      // Cleanup
      const cleanupResult = await cleanupTestData(localMockBase);
      expect(cleanupResult.success).toBe(true);
    });
  });
});