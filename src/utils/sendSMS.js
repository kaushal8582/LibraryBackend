'use strict';

const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = require('../config/env');
const logger = require('../config/logger');

// Create Twilio client if credentials are available
let client;
try {
  if (TWILIO_ACCOUNT_SID && TWILIO_ACCOUNT_SID.startsWith('AC') && TWILIO_AUTH_TOKEN) {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } else {
    logger.warn('Twilio credentials not properly configured. SMS functionality disabled.');
  }
} catch (error) {
  logger.error(`Error initializing Twilio client: ${error.message}`);
}

// Send SMS
const sendSMS = async (to, body) => {
  try {
    if (!client) {
      logger.warn('SMS not sent: Twilio client not initialized');
      return { status: 'error', message: 'SMS service not available' };
    }
    
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to
    });
    
    logger.info(`SMS sent: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`);
    return { status: 'error', message: error.message };
  }
};

module.exports = {
  sendSMS
};