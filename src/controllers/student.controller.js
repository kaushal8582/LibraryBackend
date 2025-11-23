'use strict';

const studentService = require('../services/student.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new student
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createStudent = async (req, res) => {
  try {

    const loggedInUser = req.user;
    const student = await studentService.createStudent(req.body,loggedInUser);
    successResponse(res, 'Student created successfully', student, 201);
  } catch (error) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Get all students
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllStudents = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const filter = req.query.search ? { search: req.query.search } : {};
    const status = req.query.status || '';
    if(status.trim() !== ''){
      filter.status = status.toLowerCase();
    }
    
    const students = await studentService.getAllStudents(filter,loggedInUser);
    successResponse(res, 'Students retrieved successfully', students);
  } catch (error) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Get student by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getStudentById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    successResponse(res, 'Student retrieved successfully', student);
  } catch (error) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Update student
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const updateStudent = async (req, res) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body,req);
    successResponse(res, 'Student updated successfully', student);
  } catch (error) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Delete student
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    successResponse(res, 'Student deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
};


module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};