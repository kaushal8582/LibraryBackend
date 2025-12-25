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
  email: Joi.string().email().trim().optional(),
  username: Joi.string().min(3).max(30).trim().optional(),
  password: Joi.string().required(),
  role: Joi.string().valid('student', 'librarian', 'admin').optional(),
  libraryId: Joi.string().optional(),
}).custom((value, helpers) => {
    // Custom validation: if role is student, username is required; otherwise email is required
    if (value.role === 'student') {
      if (!value.username) {
        return helpers.error('any.custom', { 
          message: 'Username is required for students' 
        });
      }
    } else if (value.role === 'librarian' || value.role === 'admin') {
      if (!value.email) {
        return helpers.error('any.custom', { 
          message: 'Email is required for librarians/admins' 
        });
      }
    } else {
      // If no role specified, at least one of email or username must be provided
      if (!value.email && !value.username) {
        return helpers.error('any.custom', { 
          message: 'Either email or username must be provided' 
        });
      }
    }
    return value;
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

// Update username validation schema
const updateUsernameSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().required()
    .pattern(/^[a-z0-9_]+$/)
    .messages({
      'string.pattern.base': 'Username can only contain lowercase letters, numbers, and underscores'
    })
});



module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
  updateUsernameSchema,
};