'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI,NODE_ENV } = require('./env');
const logger = require('./logger');


const URI =MONGODB_URI

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;