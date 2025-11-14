'use strict';

const Joi = require('joi');

// Register validation schema
const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'librarian'),
  phoneNo: Joi.string().trim().required(),
  libraryName : Joi.string().trim().required(),
  // libraryId: Joi.string().when('role', {
  //   is: 'librarian',
  //   then: Joi.required()
  // })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required(),
  role: Joi.string().optional(),
  libraryId: Joi.string().optional(),
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Update password validation schema
const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});



module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
};