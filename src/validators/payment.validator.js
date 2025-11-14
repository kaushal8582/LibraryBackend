'use strict';

const Joi = require('joi');

// Create payment schema
const createPaymentSchema = Joi.object({
  studentId: Joi.string().required().messages({
    'string.empty': 'Student ID is required',
    'any.required': 'Student ID is required'
  }),
  libraryId: Joi.string().required().messages({
    'string.empty': 'Library ID is required',
    'any.required': 'Library ID is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('INR').default('INR').messages({
    'string.base': 'Currency must be a string',
    'any.only': 'Currency must be INR'
  }),
  description: Joi.string().optional().messages({
    'string.base': 'Description must be a string'
  }),
  month: Joi.string().optional().pattern(/^\d{4}-\d{2}$/).messages({
    'string.pattern.base': 'Month must be in YYYY-MM format'
  })
});

// Verify payment schema
const verifyPaymentSchema = Joi.object({
  razorpay_payment_id: Joi.string().required().messages({
    'string.empty': 'Razorpay payment ID is required',
    'any.required': 'Razorpay payment ID is required'
  }),
  razorpay_order_id: Joi.string().required().messages({
    'string.empty': 'Razorpay order ID is required',
    'any.required': 'Razorpay order ID is required'
  }),
  razorpay_signature: Joi.string().required().messages({
    'string.empty': 'Razorpay signature is required',
    'any.required': 'Razorpay signature is required'
  })
});

module.exports = {
  createPaymentSchema,
  verifyPaymentSchema
};