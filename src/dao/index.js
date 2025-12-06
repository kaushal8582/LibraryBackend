'use strict';

const mongoose = require('mongoose');
require('../models/user.model');
require('../models/library.model');
require('../models/student.model');
require('../models/payment.model');
require('../models/reminder.model');
require('../models/review.model');



// Fetch multiple documents
const getData = async (modelName, criteria, projection = {}, options = { lean: true }) => {
    options.lean = true;
    return await mongoose.model(modelName).find(criteria, projection, options);
};

// Fetch single document
const getOneData = async (modelName, criteria, projection = {}, options = { lean: true }) => {
    options.lean = true;
    return await mongoose.model(modelName).findOne(criteria, projection, options);
};

// Insert one document
const createData = async (modelName, objToSave) => {
    return await mongoose.model(modelName).insertMany([objToSave]);
};

// Insert multiple documents
const createManyData = async (modelName, objToSave) => {
    return await mongoose.model(modelName).insertMany(objToSave);
};

// Update multiple documents
const updateManyData = async (modelName, criteria, dataToSet, options = {}) => {
    return await mongoose.model(modelName).updateMany(criteria, dataToSet, options);
};

// Update single document
const updateData = async (modelName, criteria, dataToSet, options = { new: true }) => {
    options.lean = true;
    return await mongoose.model(modelName).findOneAndUpdate(criteria, dataToSet, options);
};

// Fetch multiple records with advanced query
const getManyData = async (modelName, criteria, projection = {}, options = { lean: true }) => {
    options.lean = true;
    return await mongoose.model(modelName).find(criteria, projection, options);
};

// Aggregation
const aggregateData = async (modelName, pipeline) => {
    return await mongoose.model(modelName).aggregate(pipeline);
};

// Count
const count = async (modelName, query) => {
  return await mongoose.model(modelName).countDocuments(query);
};

module.exports = {
    getData,
    getOneData,
    createData,
    createManyData,
    updateManyData,
    updateData,
    getManyData,
    aggregateData,
    count
};