'use strict';

const libraryService = require('../services/library.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Create library controller
const createLibrary = async (req, res) => {
  try {
    const result = await libraryService.createLibrary(req.body);
    return successResponse(res, 'Library created successfully', result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all libraries controller
const getAllLibraries = async (req, res) => {
  try {
    const result = await libraryService.getAllLibraries();
    return successResponse(res, 'Libraries retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get library by ID controller
const getLibraryById = async (req, res) => {
  try {
    const result = await libraryService.getLibraryById(req.params.id);
    return successResponse(res, 'Library retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Update library controller
const updateLibrary = async (req, res) => {
  try {
    const result = await libraryService.updateLibrary(req.params.id, req.body);
    return successResponse(res, 'Library updated successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Delete library controller
const deleteLibrary = async (req, res) => {
  try {
    await libraryService.deleteLibrary(req.params.id);
    return successResponse(res, 'Library deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createLibrary,
  getAllLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary
};