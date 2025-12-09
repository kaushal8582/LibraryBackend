'use strict';

const Joi = require('joi');


const addQueryValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  message: Joi.string().required(),
  subject: Joi.string().optional(),
});



module.exports = {
  addQueryValidator,
};