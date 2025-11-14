'use strict';

const dashboardService = require('../services/dashboard.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get library dashboard summary
const getLibrarySummary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const { month } = req.query;
    
    const summary = await dashboardService.getLibrarySummary(libraryId, month);
    return successResponse(res, 'Dashboard summary retrieved successfully', summary);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get library analytics data
const getLibraryAnalytics = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const { startDate, endDate } = req.query;
    
    const analytics = await dashboardService.getLibraryAnalytics(libraryId, startDate, endDate);
    return successResponse(res, 'Analytics data retrieved successfully', analytics);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  getLibrarySummary,
  getLibraryAnalytics
};