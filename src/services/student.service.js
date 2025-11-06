'use strict';

const DAO = require('../dao');
const { STUDENT_MODEL, LIBRARY_MODEL } = require('../utils/constants');
const { AppError } = require('../utils/errorHandler');

/**
 * Create a new student
 * @param {Object} studentData - Student data
 * @returns {Promise<Object>} Created student
 */
const createStudent = async (studentData,loggedInUser) => {
  // Check if student already exists
  const existingStudent = await DAO.getOneData(STUDENT_MODEL, { 
    email: studentData.email,
    libraryId: loggedInUser?.libraryId 
  });
  
  if (existingStudent) {
    throw new AppError('Student already exists', 400, 'STUDENT_ALREADY_EXISTS');
  }
  
  const payload ={
    name : studentData.name,
    email : studentData.email,
    libraryId : loggedInUser?.libraryId,
    phone : studentData.phone,
    address : studentData?.address,
    fee : studentData?.fee,
    timing : studentData?.timing,
  }
  
  // Create student
  const student = await DAO.createData(STUDENT_MODEL, payload);

  if(!student){
    throw new AppError('Student not created', 400, 'STUDENT_NOT_CREATED');
  }

  return student;
};

/**
 * Get all students
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Array>} List of students
 */
const getAllStudents = async (filter = {}) => {
  return DAO.getData(STUDENT_MODEL, filter);
};

/**
 * Get student by ID
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Student
 */
const getStudentById = async (id) => {
  const student = await DAO.getOneData(STUDENT_MODEL, { _id: id });
  
  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  return student;
};

/**
 * Update student
 * @param {string} id - Student ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated student
 */
const updateStudent = async (id, updateData) => {
  const student = await DAO.getOneData(STUDENT_MODEL, { _id: id });
  
  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  return DAO.updateData(STUDENT_MODEL, { _id: id }, updateData);
};

/**
 * Delete student
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Deleted student
 */
const deleteStudent = async (id) => {
  const student = await DAO.getOneData(STUDENT_MODEL, { _id: id });
  
  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
  
  return DAO.deleteData(STUDENT_MODEL, { _id: id });
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};