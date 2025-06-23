/**
 * Database Utilities
 * Helper functions for database operations with Airtable and Google Sheets
 */

const Airtable = require('airtable');
const { google } = require('googleapis');
const logger = require('./logging-utils');

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
 * Airtable Helper Functions
 */
class AirtableUtils {
  /**
   * Get all records from a table with optional filtering
   */
  static async getAllRecords(tableName, options = {}) {
    try {
      const records = await base(tableName)
        .select({
          maxRecords: options.maxRecords || 100,
          filterByFormula: options.filterByFormula || '',
          sort: options.sort || [],
          view: options.view || 'Grid view'
        })
        .all();
      
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.getAllRecords',
        tableName,
        options
      });
      throw error;
    }
  }

  /**
   * Get a single record by ID
   */
  static async getRecordById(tableName, recordId) {
    try {
      const record = await base(tableName).find(recordId);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.getRecordById',
        tableName,
        recordId
      });
      throw error;
    }
  }

  /**
   * Find records by field value
   */
  static async findRecordsByField(tableName, fieldName, fieldValue) {
    try {
      const records = await base(tableName)
        .select({
          filterByFormula: `{${fieldName}} = '${fieldValue}'`
        })
        .all();
      
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.findRecordsByField',
        tableName,
        fieldName,
        fieldValue
      });
      throw error;
    }
  }

  /**
   * Create a new record
   */
  static async createRecord(tableName, fields) {
    try {
      const record = await base(tableName).create(fields);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.createRecord',
        tableName,
        fields
      });
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  static async updateRecord(tableName, recordId, fields) {
    try {
      const record = await base(tableName).update(recordId, fields);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.updateRecord',
        tableName,
        recordId,
        fields
      });
      throw error;
    }
  }

  /**
   * Delete a record
   */
  static async deleteRecord(tableName, recordId) {
    try {
      const deletedRecord = await base(tableName).destroy(recordId);
      return { id: deletedRecord.id };
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.deleteRecord',
        tableName,
        recordId
      });
      throw error;
    }
  }

  /**
   * Batch create multiple records
   */
  static async batchCreateRecords(tableName, recordsArray) {
    try {
      const chunks = [];
      const chunkSize = 10; // Airtable limit
      
      for (let i = 0; i < recordsArray.length; i += chunkSize) {
        chunks.push(recordsArray.slice(i, i + chunkSize));
      }
      
      const results = [];
      for (const chunk of chunks) {
        const records = await base(tableName).create(chunk);
        results.push(...records.map(record => ({
          id: record.id,
          ...record.fields
        })));
      }
      
      return results;
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.batchCreateRecords',
        tableName,
        recordCount: recordsArray.length
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    try {
      const userRecords = await this.findRecordsByField(
        process.env.AIRTABLE_USERS_TABLE || 'Users',
        'user_id',
        userId
      );
      
      if (userRecords.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userRecords[0];
      
      // Get user's lessons
      const lessons = await this.findRecordsByField(
        process.env.AIRTABLE_LESSONS_TABLE || 'Lessons',
        'user_id',
        userId
      );
      
      const completedLessons = lessons.filter(lesson => lesson.status === 'completed');
      const pendingLessons = lessons.filter(lesson => lesson.status === 'pending');
      
      const totalEngagement = completedLessons.reduce(
        (sum, lesson) => sum + (lesson.engagement_score || 0), 
        0
      );
      
      return {
        user_id: userId,
        name: user.name,
        email: user.email,
        registration_date: user.registration_date,
        status: user.status,
        total_lessons: lessons.length,
        completed_lessons: completedLessons.length,
        pending_lessons: pendingLessons.length,
        completion_rate: lessons.length > 0 
          ? Math.round((completedLessons.length / lessons.length) * 100)
          : 0,
        average_engagement: completedLessons.length > 0 
          ? Math.round(totalEngagement / completedLessons.length)
          : 0,
        last_activity: user.last_activity
      };
    } catch (error) {
      logger.logError(error, {
        context: 'AirtableUtils.getUserStats',
        userId
      });
      throw error;
    }
  }
}

/**
 * Google Sheets Helper Functions
 */
class GoogleSheetsUtils {
  /**
   * Append data to a sheet
   */
  static async appendToSheet(sheetName, values) {
    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        throw new Error('Google Sheets ID not configured');
      }
      
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        resource: {
          values: Array.isArray(values[0]) ? values : [values]
        }
      });
      
      return result.data;
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.appendToSheet',
        sheetName,
        valueCount: values.length
      });
      throw error;
    }
  }

  /**
   * Read data from a sheet
   */
  static async readFromSheet(sheetName, range = 'A:Z') {
    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        throw new Error('Google Sheets ID not configured');
      }
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!${range}`
      });
      
      return result.data.values || [];
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.readFromSheet',
        sheetName,
        range
      });
      throw error;
    }
  }

  /**
   * Update data in a sheet
   */
  static async updateSheet(sheetName, range, values) {
    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        throw new Error('Google Sheets ID not configured');
      }
      
      const result = await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!${range}`,
        valueInputOption: 'RAW',
        resource: {
          values: Array.isArray(values[0]) ? values : [values]
        }
      });
      
      return result.data;
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.updateSheet',
        sheetName,
        range
      });
      throw error;
    }
  }

  /**
   * Clear data from a sheet
   */
  static async clearSheet(sheetName, range = 'A:Z') {
    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        throw new Error('Google Sheets ID not configured');
      }
      
      const result = await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${sheetName}!${range}`
      });
      
      return result.data;
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.clearSheet',
        sheetName,
        range
      });
      throw error;
    }
  }

  /**
   * Log engagement event to Google Sheets
   */
  static async logEngagementEvent(userId, eventType, eventData, score = 1) {
    try {
      const timestamp = new Date().toISOString();
      const date = timestamp.split('T')[0];
      
      await this.appendToSheet('Engagement', [
        timestamp,
        userId,
        eventType,
        'engagement',
        JSON.stringify(eventData),
        score,
        date,
        'UTC'
      ]);
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.logEngagementEvent',
        userId,
        eventType
      });
      // Don't throw error for logging failures
    }
  }

  /**
   * Log performance metrics to Google Sheets
   */
  static async logPerformanceMetric(metricName, value, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const date = timestamp.split('T')[0];
      
      await this.appendToSheet('Performance', [
        timestamp,
        metricName,
        value,
        JSON.stringify(context),
        date
      ]);
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.logPerformanceMetric',
        metricName,
        value
      });
      // Don't throw error for logging failures
    }
  }

  /**
   * Get engagement analytics from Google Sheets
   */
  static async getEngagementAnalytics(days = 30) {
    try {
      const data = await this.readFromSheet('Engagement');
      if (data.length <= 1) return { events: [], summary: {} };
      
      const headers = data[0];
      const rows = data.slice(1);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentEvents = rows
        .map(row => {
          const event = {};
          headers.forEach((header, index) => {
            event[header] = row[index] || '';
          });
          return event;
        })
        .filter(event => new Date(event.timestamp) >= cutoffDate);
      
      const summary = {
        total_events: recentEvents.length,
        unique_users: new Set(recentEvents.map(e => e.user_id)).size,
        event_types: {},
        daily_activity: {}
      };
      
      recentEvents.forEach(event => {
        // Count event types
        summary.event_types[event.event_type] = 
          (summary.event_types[event.event_type] || 0) + 1;
        
        // Count daily activity
        const date = event.date || event.timestamp.split('T')[0];
        summary.daily_activity[date] = 
          (summary.daily_activity[date] || 0) + 1;
      });
      
      return {
        events: recentEvents,
        summary
      };
    } catch (error) {
      logger.logError(error, {
        context: 'GoogleSheetsUtils.getEngagementAnalytics',
        days
      });
      throw error;
    }
  }
}

/**
 * Database Connection Health Check
 */
class DatabaseHealth {
  /**
   * Check Airtable connection
   */
  static async checkAirtable() {
    try {
      await base(process.env.AIRTABLE_USERS_TABLE || 'Users')
        .select({ maxRecords: 1 })
        .firstPage();
      return { status: 'healthy', message: 'Airtable connection successful' };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Airtable connection failed', 
        error: error.message 
      };
    }
  }

  /**
   * Check Google Sheets connection
   */
  static async checkGoogleSheets() {
    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        return { status: 'not_configured', message: 'Google Sheets ID not set' };
      }
      
      await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID
      });
      return { status: 'healthy', message: 'Google Sheets connection successful' };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Google Sheets connection failed', 
        error: error.message 
      };
    }
  }

  /**
   * Get overall database health status
   */
  static async getHealthStatus() {
    const airtableHealth = await this.checkAirtable();
    const sheetsHealth = await this.checkGoogleSheets();
    
    const overallStatus = 
      airtableHealth.status === 'healthy' && 
      (sheetsHealth.status === 'healthy' || sheetsHealth.status === 'not_configured')
        ? 'healthy'
        : 'degraded';
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        airtable: airtableHealth,
        google_sheets: sheetsHealth
      }
    };
  }
}

module.exports = {
  AirtableUtils,
  GoogleSheetsUtils,
  DatabaseHealth
};