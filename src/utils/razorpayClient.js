'use strict';

const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config/env');
const logger = require('../config/logger');

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Create order
const createOrder = async (amount, currency = 'INR', receipt = 'order_receipt', notes = {}) => {
  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
      notes
    };
    
    return await razorpayInstance.orders.create(options);
  } catch (error) {
    logger.error(`Error creating Razorpay order: ${error.message}`);
    throw error;
  }
};

// Verify payment
const verifyPayment = (paymentId, orderId, signature) => {
  try {
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    logger.error(`Error verifying Razorpay payment: ${error.message}`);
    throw error;
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  verifyPayment
};