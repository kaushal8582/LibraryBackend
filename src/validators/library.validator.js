'use strict';

const Joi = require('joi');

// Create library validation schema
const createLibrarySchema = Joi.object({
  name: Joi.string().required().trim(),
  address: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  state: Joi.string().required().trim(),
  zipCode: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  phone: Joi.string().required().trim(),
  subscriptionStatus: Joi.string().valid('active', 'inactive', 'pending').default('active'),
  settings: Joi.object({
    reminderFrequency: Joi.string().valid('daily', 'weekly', 'monthly').default('weekly'),
    paymentGateway: Joi.string().valid('razorpay', 'stripe').default('razorpay'),
    notificationChannels: Joi.array().items(Joi.string().valid('email', 'sms')).default(['email'])
  })
});
 
// Update library validation schema
const updateLibrarySchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().optional(),
  contactEmail : Joi.string().email().trim().required(),
  contactPhone : Joi.string().trim().required(),
});

module.exports = {
  createLibrarySchema,
  updateLibrarySchema
};