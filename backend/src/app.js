/**
 * Micro-Learning Scheduler - Main Application
 * Express.js server with API endpoints for the learning system
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/error-handling');
const requestLogger = require('./middleware/request-logging');
const rateLimiter = require('./middleware/rate-limiting');

// Import controllers
const userController = require('./controllers/user-controller');
const lessonController = require('./controllers/lesson-controller');
const engagementController = require('./controllers/engagement-controller');
const analyticsController = require('./controllers/analytics-controller');

// Import services
const logger = require('./utils/logging-utils');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(rateLimiter);

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/users', userController);
app.use('/api/lessons', lessonController);
app.use('/api/engagement', engagementController);
app.use('/api/analytics', analyticsController);

// Webhook endpoint for n8n integration
app.post('/webhook/learning-signup', async (req, res) => {
  try {
    logger.info('Received learning signup webhook', { data: req.body });
    
    // Validate required fields
    const { name, email, skill_gaps } = req.body;
    if (!name || !email || !skill_gaps) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, skill_gaps'
      });
    }

    // Process the signup (this will be handled by n8n workflow)
    res.status(200).json({
      message: 'Registration received successfully',
      user_id: email.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      timestamp: new Date().toISOString()
    });

    logger.info('Learning signup processed successfully', { email });
  } catch (error) {
    logger.error('Error processing learning signup', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend registration form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/registration-form/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/admin-dashboard/index.html'));
});

app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/user-portal/dashboard.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Micro-Learning Scheduler server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;