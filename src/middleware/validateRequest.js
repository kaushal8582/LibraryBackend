'use strict';

const { errorResponse } = require('../utils/responseHandler');
const ERROR_CODES = require('../utils/errorCodes');

// Validate request middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return errorResponse(res, message, 400);
    }
    
    next();
  };
};

module.exports = validateRequest;