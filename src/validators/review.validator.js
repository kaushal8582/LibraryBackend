'use strict';

const Joi = require('joi');


const addRevieValidator = Joi.object({
  libraryId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().optional(),
});
const updateRevieValidator = Joi.object({
  reviewId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  reviewText: Joi.string().optional(),
});


module.exports = {
  addRevieValidator,
  updateRevieValidator,
};