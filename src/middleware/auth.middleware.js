'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { errorResponse } = require('../utils/responseHandler');
const ERROR_CODES = require('../utils/errorCodes');
const DAO = require("../dao");
const { USER_MODEL } = require('../utils/constants');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return errorResponse(res, ERROR_CODES.UNAUTHORIZED.message, 401);
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // getLoggedInUserData

    const data = await DAO.getOneData(USER_MODEL,{_id : decoded.id})
    
    // Add user ID to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user =  data;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, ERROR_CODES.TOKEN_EXPIRED.message, 401);
    }
    return errorResponse(res, ERROR_CODES.INVALID_TOKEN.message, 401);
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return errorResponse(res, ERROR_CODES.UNAUTHORIZED.message, 403);
  }
  next();
}

// Admin or librarian middleware
const adminOrLibrarianOnly = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'librarian') {
    return errorResponse(res, ERROR_CODES.FORBIDDEN.message, 403);
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  adminOrLibrarianOnly
};