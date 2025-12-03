'use strict';

const DAO = require('../dao');
const { LIBRARY_MODEL, USER_MODEL } = require('../utils/constants');
const ERROR_CODES = require('../utils/errorCodes');

// Create library
const createLibrary = async (libraryData) => {
  // Check if library with same name exists
  const existingLibrary = await DAO.getOneData(LIBRARY_MODEL, { name: libraryData.name });
  
  if (existingLibrary) {
    throw new Error(ERROR_CODES.LIBRARY_ALREADY_EXISTS.message);
  }
  
  // Create library
  const result = await DAO.createData(LIBRARY_MODEL, libraryData);
  return result[0];
};

// Get all libraries
const getAllLibraries = async (query = {}) => {
  return await DAO.getData(LIBRARY_MODEL, query);
};

// Get library by ID
const getLibraryById = async (id) => {
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });
  
  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }
  
  return library;
};

// Update library
const updateLibrary = async (id, libraryData) => {
  const {userName,profileImg} =libraryData
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });
  const LibrarianData = await DAO.getOneData(USER_MODEL,{libraryId:id,role:'librarian'});
  if(!LibrarianData){
    throw new Error("User Not Found");
  }

  const updateData = {};

  if(userName){
    updateData.name = userName;
  }
  
  if(profileImg){
    updateData.avtar = profileImg;
  }

  const updateResult = await DAO.updateData(USER_MODEL, { _id: LibrarianData._id }, updateData);
  
  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }
  
  return await DAO.updateData(LIBRARY_MODEL, { _id: id }, libraryData);
};

// Delete library
const deleteLibrary = async (id) => {
  const library = await DAO.getOneData(LIBRARY_MODEL, { _id: id });
  
  if (!library) {
    throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
  }
  
  return await DAO.updateData(LIBRARY_MODEL, { _id: id }, { isActive: false });
};

module.exports = {
  createLibrary,
  getAllLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary
};