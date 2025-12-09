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
  name: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),
  contactEmail : Joi.string().email().trim().optional(),
  contactPhone : Joi.string().trim().optional(),
  userName : Joi.string().trim().optional(),
  profileImg : Joi.string().trim().optional(),
  heroImg : Joi.string().trim().optional(),
  galleryPhotos : Joi.array().items(Joi.string().trim().optional()),
  openingHours : Joi.string().trim().optional(),
  closingHours : Joi.string().trim().optional(),
  openForDays : Joi.array().items(Joi.string().trim().optional()),
  plans : Joi.array().items(Joi.object({
    hours : Joi.string().trim().optional(),
    price : Joi.string().trim().optional(),
  })).optional(),
  facilities : Joi.array().items(Joi.string().trim().optional()),
  aboutLibrary : Joi.string().trim().optional(),
  bio : Joi.string().trim().optional(),
  razorPayKey : Joi.string().trim().optional(),
  razorPaySecret : Joi.string().trim().optional(),
  razorPayWebhookSecret : Joi.string().trim().optional(),
  razorPayAccountId : Joi.string().trim().optional(),
});

module.exports = {
  createLibrarySchema,
  updateLibrarySchema
};