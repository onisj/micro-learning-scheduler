// Mock googleapis module
jest.mock('googleapis', () => {
  const mockSheets = {
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
  
  return {
    google: {
      sheets: jest.fn(() => mockSheets),
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({})
        }))
      }
    }
  };
});

// Import the module to test
const {
  initializeGoogleSheets,
  testConnection,
  setupHeaders,
  createSampleData,
  verifySheetStructure,
  cleanupTestData
} = require('../../../database/google-sheets/setup/sheets-setup');

const { google } = require('googleapis');

describe('Google Sheets Setup Tests', () => {
  let mockSheets;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSheets = {
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
    google.sheets.mockReturnValue(mockSheets);
  });

  describe('initializeGoogleSheets', () => {
    it('should initialize Google Sheets with correct configuration', async () => {
      const config = {
        keyFile: 'path/to/keyfile.json',
        spreadsheetId: '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      };
      
      const result = await initializeGoogleSheets(config);
      
      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        keyFile: config.keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      expect(result).toBeDefined();
    });

    it('should throw error when keyFile is missing', async () => {
      await expect(initializeGoogleSheets({
        spreadsheetId: '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      })).rejects.toThrow('Key file is required');
    });

    it('should throw error when spreadsheetId is missing', async () => {
      await expect(initializeGoogleSheets({
        keyFile: 'path/to/keyfile.json'
      })).rejects.toThrow('Spreadsheet ID is required');
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection', async () => {
      const mockSpreadsheet = {
        data: {
          properties: {
            title: 'Test Spreadsheet'
          },
          sheets: [
            { properties: { title: 'Users' } },
            { properties: { title: 'Lessons' } }
          ]
        }
      };
      
      mockSheets.spreadsheets.get.mockResolvedValue(mockSpreadsheet);
      
      const result = await testConnection(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      
      expect(result.success).toBe(true);
      expect(result.spreadsheetTitle).toBe('Test Spreadsheet');
      expect(result.sheetsFound).toEqual(['Users', 'Lessons']);
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockSheets.spreadsheets.get.mockRejectedValue(error);
      
      const result = await testConnection(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('setupHeaders', () => {
    it('should setup Users sheet headers', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 16 }
      });
      
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Users');
      
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        range: 'Users!A1:P1',
        valueInputOption: 'RAW',
        resource: {
          values: [[
            'User ID', 'Name', 'Email', 'WhatsApp', 'Job Title',
            'Skill Gaps', 'Learning Goals', 'Preferred Format',
            'Availability', 'Timezone', 'Language', 'Experience Level',
            'Industry', 'Department', 'Created At', 'Updated At'
          ]]
        }
      });
      expect(result.success).toBe(true);
    });

    it('should setup Lessons sheet headers', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 18 }
      });
      
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Lessons');
      
      expect(result.success).toBe(true);
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({
          range: 'Lessons!A1:R1'
        })
      );
    });

    it('should setup Analytics sheet headers', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 12 }
      });
      
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Analytics');
      
      expect(result.success).toBe(true);
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({
          range: 'Analytics!A1:L1'
        })
      );
    });

    it('should setup Engagement sheet headers', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedCells: 14 }
      });
      
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Engagement');
      
      expect(result.success).toBe(true);
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({
          range: 'Engagement!A1:N1'
        })
      );
    });

    it('should handle invalid sheet type', async () => {
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid sheet type: Invalid');
    });

    it('should handle setup errors', async () => {
      const error = new Error('Setup failed');
      mockSheets.spreadsheets.values.update.mockRejectedValue(error);
      
      const result = await setupHeaders(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Users');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Setup failed');
    });
  });

  describe('createSampleData', () => {
    it('should create sample users data', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedRows: 3 }
      });
      
      const result = await createSampleData(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Users');
      
      expect(result.success).toBe(true);
      expect(result.rowsCreated).toBe(3);
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({
          range: 'Users!A2:P4'
        })
      );
    });

    it('should create sample lessons data', async () => {
      mockSheets.spreadsheets.values.update.mockResolvedValue({
        data: { updatedRows: 5 }
      });
      
      const result = await createSampleData(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Lessons');
      
      expect(result.success).toBe(true);
      expect(result.rowsCreated).toBe(5);
    });

    it('should handle invalid data type', async () => {
      const result = await createSampleData(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid data type: Invalid');
    });
  });

  describe('verifySheetStructure', () => {
    it('should verify Users sheet structure', async () => {
      const mockData = {
        data: {
          values: [
            ['User ID', 'Name', 'Email', 'WhatsApp', 'Job Title'],
            ['user-1', 'John Doe', 'john@example.com', '+1234567890', 'Developer']
          ]
        }
      };
      
      mockSheets.spreadsheets.values.get.mockResolvedValue(mockData);
      
      const result = await verifySheetStructure(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Users');
      
      expect(result.success).toBe(true);
      expect(result.headersFound).toContain('User ID');
      expect(result.headersFound).toContain('Name');
      expect(result.headersFound).toContain('Email');
      expect(result.dataRows).toBe(1);
    });

    it('should handle empty sheet', async () => {
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [] }
      });
      
      const result = await verifySheetStructure(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Users');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No data found in sheet');
    });
  });

  describe('cleanupTestData', () => {
    it('should cleanup test data successfully', async () => {
      const mockData = {
        data: {
          values: [
            ['User ID', 'Name', 'Email'],
            ['test-1', 'Test User 1', 'test1@example.com'],
            ['test-2', 'Test User 2', 'test2@example.com'],
            ['user-1', 'Real User', 'real@example.com']
          ]
        }
      };
      
      mockSheets.spreadsheets.values.get.mockResolvedValue(mockData);
      mockSheets.spreadsheets.batchUpdate.mockResolvedValue({
        data: { replies: [{ deleteDimension: { deletedCount: 2 } }] }
      });
      
      const result = await cleanupTestData(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      
      expect(result.success).toBe(true);
      expect(result.rowsDeleted).toBe(2);
    });

    it('should handle cleanup errors', async () => {
      const error = new Error('Cleanup failed');
      mockSheets.spreadsheets.values.get.mockRejectedValue(error);
      
      const result = await cleanupTestData(mockSheets, '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cleanup failed');
    });
  });
});

// Integration test for full setup process
describe('Google Sheets Setup Integration', () => {
  it('should complete full setup process', async () => {
    const mockSheets = {
      spreadsheets: {
        values: {
          update: jest.fn().mockResolvedValue({ data: { updatedCells: 10 } }),
          get: jest.fn().mockResolvedValue({
            data: {
              values: [
                ['User ID', 'Name', 'Email'],
                ['user-1', 'Test User', 'test@example.com']
              ]
            }
          }),
          batchUpdate: jest.fn().mockResolvedValue({ data: { replies: [] } })
        },
        get: jest.fn().mockResolvedValue({
          data: {
            properties: { title: 'Test Spreadsheet' },
            sheets: [{ properties: { title: 'Users' } }]
          }
        }),
        batchUpdate: jest.fn().mockResolvedValue({ data: { replies: [] } })
      }
    };
    
    const spreadsheetId = '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    
    // Test connection
    const connectionResult = await testConnection(mockSheets, spreadsheetId);
    expect(connectionResult.success).toBe(true);
    
    // Setup headers
    const headersResult = await setupHeaders(mockSheets, spreadsheetId, 'Users');
    expect(headersResult.success).toBe(true);
    
    // Create sample data
    const dataResult = await createSampleData(mockSheets, spreadsheetId, 'Users');
    expect(dataResult.success).toBe(true);
    
    // Verify structure
    const structureResult = await verifySheetStructure(mockSheets, spreadsheetId, 'Users');
    expect(structureResult.success).toBe(true);
    
    // Cleanup
    const cleanupResult = await cleanupTestData(mockSheets, spreadsheetId);
    expect(cleanupResult.success).toBe(true);
  });
});