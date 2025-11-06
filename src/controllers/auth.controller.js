'use strict';

const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Register controller
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, 'Login successful', result);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

// Refresh token controller
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, 'Token refreshed successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};
const getInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await authService.userInfo(userId);
    return successResponse(res, 'User Info Get Successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getInfo
};