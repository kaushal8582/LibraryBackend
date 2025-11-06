'use strict';

const logger = require('../config/logger');
const ERROR_CODES = require('../utils/errorCodes');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`);
  
  // Default error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = ERROR_CODES.INVALID_TOKEN.message;
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = ERROR_CODES.TOKEN_EXPIRED.message;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;