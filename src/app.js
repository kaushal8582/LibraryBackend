'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const bodyParser = require("body-parser")

// Import routes
const authRoutes = require('./routes/auth.routes');
const libraryRoutes = require('./routes/library.routes');
const studentRoutes = require('./routes/student.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reviewRoutes = require('./routes/review.routes');

const paymentController = require('./controllers/payment.controller');



// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import config
const { NODE_ENV, PORT } = require('./config/env');
const swaggerOptions = require('./config/swagger');
const logger = require('./config/logger');

// Initialize express app
const app = express();

app.post(
  "/api/payments/razorpay/webhook",
  bodyParser.raw({ type: "*/*" }),   
  paymentController.razorpayWebhook
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger documentation
if (NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));
  logger.info(`Swagger docs available at http://localhost:5002/api-docs`);
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date()
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/libraries', libraryRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/reviews", reviewRoutes);



// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;