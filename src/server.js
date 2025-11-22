'use strict';

const app = require('./app');
const { PORT } = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');

// Import sendReminderEmails function
const { sendReminderEmails } = require('./services/cronService');
// Connect to database
connectDB();

// Cron jobs will be initialized later

// sendReminderEmails();

// Commented out for initial development
// const { scheduleReminderJob } = require('./utils/cronJobs');
// scheduleReminderJob();

// Start server - force port 5002 to avoid conflicts
const server = app.listen(5002, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port 5002`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Exit process
  process.exit(1);
});