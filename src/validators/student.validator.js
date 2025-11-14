'use strict';

const Joi = require('joi');

// Create student validation schema
const createStudentSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{10}$/).required(),
  address: Joi.string().optional(),
  fee : Joi.string().required(),
  timing : Joi.string().optional(),
  joinDate : Joi.date().required(),
});

// Update student validation schema
const updateStudentSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\d{10}$/),
  address: Joi.string(),
  fee : Joi.string(),
  timing : Joi.string(),
  joinDate : Joi.date(),
  status : Joi.string().optional(),
  
}).min(1);

module.exports = {
  createStudentSchema,
  updateStudentSchema
};