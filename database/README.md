# Database Setup - Phase 2 Implementation

This directory contains the complete database setup for the Micro Learning Scheduler project, supporting both Airtable and Google Sheets as data storage solutions.

## Overview

The database layer provides:
- **Airtable Integration**: Primary database with structured tables for users, lessons, analytics, and engagement
- **Google Sheets Integration**: Secondary option with dashboard capabilities and real-time analytics
- **Data Synchronization**: Field mappings and transformations between application and database formats
- **Sample Data**: Pre-configured test data for development and testing

## Directory Structure

```
database/
├── airtable/
│   ├── config/
│   │   ├── base-config.js          # Airtable base configuration
│   │   └── field-mappings.js       # Field mappings and data transformations
│   ├── schema/
│   │   ├── users-table-schema.json      # Users table schema
│   │   ├── lessons-table-schema.json    # Lessons table schema
│   │   ├── analytics-table-schema.json  # Analytics table schema
│   │   └── engagement-table-schema.json # Engagement table schema
│   └── setup/
│       ├── airtable-setup.js       # Airtable initialization script
│       └── sample-data.js          # Sample data for testing
├── google-sheets/
│   ├── setup/
│   │   ├── sheets-setup.js         # Google Sheets initialization
│   │   ├── charts-config.js        # Dashboard charts configuration
│   │   └── formulas-config.js      # Spreadsheet formulas and calculations
│   └── templates/
│       ├── analytics-dashboard-template.xlsx
│       ├── engagement-sheet-template.xlsx
│       └── performance-metrics-template.xlsx
└── README.md                       # This file
```

## Database Schema

### Users Table
Stores user registration and profile information:
- **user_id**: Unique identifier
- **name**: User's full name
- **email**: Email address
- **whatsapp**: WhatsApp number
- **job_title**: Professional role
- **skill_gaps**: Areas for improvement (array)
- **learning_format**: Preferred content type
- **preferred_time**: Optimal learning time
- **timezone**: User's timezone
- **registration_date**: Account creation date
- **last_learning_session**: Last activity timestamp
- **total_sessions**: Number of completed sessions
- **completion_rate**: Percentage of completed lessons
- **status**: Account status (active/inactive/suspended)
- **calendar_email**: Calendar integration email
- **notification_preferences**: Communication settings (array)

### Lessons Table
Manages lesson content and delivery:
- **lesson_id**: Unique lesson identifier
- **user_id**: Associated user
- **day**: Lesson sequence number
- **title**: Lesson title
- **content_type**: Format (video/text/interactive)
- **description**: Lesson description
- **keywords**: Search tags (array)
- **difficulty_level**: Complexity rating
- **estimated_duration**: Expected completion time
- **status**: Current state (draft/scheduled/delivered/completed)
- **created_date**: Content creation timestamp
- **delivery_date**: Scheduled delivery time
- **completion_date**: User completion timestamp
- **delivery_method**: Distribution channel
- **engagement_score**: User interaction rating
- **user_feedback**: User comments and ratings

### Analytics Table
Tracks user performance and system metrics:
- **analytics_id**: Unique record identifier
- **user_id**: Associated user
- **date**: Analytics date
- **lessons_delivered**: Daily lesson count
- **lessons_completed**: Daily completion count
- **total_engagement_time**: Session duration
- **average_engagement_score**: Daily average score
- **completion_rate**: Daily completion percentage
- **preferred_content_type**: Most used format
- **peak_engagement_time**: Optimal learning hour

### Engagement Table
Captures detailed user interaction data:
- **engagement_id**: Unique interaction identifier
- **user_id**: Associated user
- **lesson_id**: Associated lesson
- **interaction_type**: Action type (view/start/pause/resume/complete/feedback)
- **timestamp**: Interaction time
- **duration**: Session length
- **device_type**: Access device (mobile/desktop/tablet)
- **location**: Geographic location
- **session_id**: Session identifier
- **user_agent**: Browser/app information
- **referrer**: Traffic source
- **engagement_score**: Interaction quality rating

## Setup Instructions

### Airtable Setup

1. **Environment Configuration**
   ```bash
   # Add to your .env file
   AIRTABLE_API_KEY=your_api_key_here
   AIRTABLE_BASE_ID=your_base_id_here
   AIRTABLE_USERS_TABLE=Users
   AIRTABLE_LESSONS_TABLE=Lessons
   AIRTABLE_ANALYTICS_TABLE=Analytics
   AIRTABLE_ENGAGEMENT_TABLE=Engagement
   ```

2. **Initialize Database**
   ```javascript
   const { setupAirtable } = require('./airtable/setup/airtable-setup');
   
   async function initializeDatabase() {
     try {
       await setupAirtable();
       console.log('Airtable setup completed successfully');
     } catch (error) {
       console.error('Setup failed:', error);
     }
   }
   ```

3. **Load Sample Data**
   ```javascript
   const { createSampleData } = require('./airtable/setup/sample-data');
   
   await createSampleData();
   ```

### Google Sheets Setup

1. **Authentication Setup**
   ```bash
   # Add to your .env file
   GOOGLE_SHEETS_CREDENTIALS_PATH=path/to/credentials.json
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   ```

2. **Initialize Sheets**
   ```javascript
   const { setupGoogleSheets } = require('./google-sheets/setup/sheets-setup');
   
   async function initializeSheets() {
     try {
       await setupGoogleSheets();
       console.log('Google Sheets setup completed successfully');
     } catch (error) {
       console.error('Setup failed:', error);
     }
   }
   ```

3. **Apply Formulas and Charts**
   ```javascript
   const { applyAllFormulas } = require('./google-sheets/setup/formulas-config');
   const { createAllCharts } = require('./google-sheets/setup/charts-config');
   
   await applyAllFormulas(sheets, spreadsheetId);
   await createAllCharts(sheets, spreadsheetId);
   ```

## Data Transformation

The system includes comprehensive field mapping and data transformation capabilities:

### Field Mappings
```javascript
const { transformToAirtable, transformFromAirtable } = require('./airtable/config/field-mappings');

// Transform application data to Airtable format
const airtableData = transformToAirtable('users', applicationData);

// Transform Airtable data to application format
const applicationData = transformFromAirtable('users', airtableData);
```

### Data Validation
```javascript
const { validateRequiredFields } = require('./airtable/config/field-mappings');

// Validate required fields before saving
validateRequiredFields('users', userData);
```

## Analytics and Reporting

### Google Sheets Dashboard
The Google Sheets integration provides:
- **Real-time Analytics**: Live data updates and calculations
- **Interactive Charts**: Visual representations of key metrics
- **Performance Metrics**: System and user performance tracking
- **Engagement Analytics**: Detailed interaction analysis

### Key Metrics Tracked
- User registration trends
- Lesson completion rates
- Engagement scores by content type
- Device usage patterns
- Peak learning times
- User retention rates
- System performance indicators

## Testing

### Sample Data
The system includes comprehensive sample data for testing:
- 10 sample users with varied profiles
- 50 sample lessons across different content types
- Analytics data spanning 30 days
- Engagement data with various interaction types

### Test Functions
```javascript
const { testConnection, cleanupTestData } = require('./airtable/setup/airtable-setup');

// Test database connection
await testConnection();

// Clean up test data
await cleanupTestData();
```

## Security Considerations

1. **API Keys**: Store all API keys in environment variables
2. **Data Validation**: Validate all input data before database operations
3. **Access Control**: Implement proper authentication and authorization
4. **Data Encryption**: Use HTTPS for all API communications
5. **Backup Strategy**: Regular data backups and recovery procedures

## Performance Optimization

1. **Batch Operations**: Use batch updates for multiple records
2. **Caching**: Implement caching for frequently accessed data
3. **Indexing**: Proper field indexing for query optimization
4. **Rate Limiting**: Respect API rate limits and implement retry logic

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API keys and credentials
   - Check environment variable configuration
   - Ensure proper permissions are set

2. **Schema Mismatches**
   - Validate field mappings
   - Check data types and formats
   - Review required field configurations

3. **Rate Limiting**
   - Implement exponential backoff
   - Use batch operations where possible
   - Monitor API usage quotas

### Debug Mode
```javascript
// Enable debug logging
process.env.DEBUG_DATABASE = 'true';
```

## Future Enhancements

1. **Real-time Synchronization**: Implement webhooks for instant updates
2. **Advanced Analytics**: Machine learning insights and predictions
3. **Multi-tenant Support**: Support for multiple organizations
4. **Data Export**: Automated backup and export functionality
5. **Performance Monitoring**: Advanced monitoring and alerting

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Contact the development team
4. Submit issues to the project repository

---

**Phase 2 Implementation Status**: ✅ Complete

All database components have been implemented and tested, providing a robust foundation for the micro-learning scheduler system.