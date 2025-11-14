"use strict";

const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require("../config/env");
const logger = require("../config/logger");
const DAO = require("../dao");
const { PAYMENT_MODEL } = require("./constants");

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Create order
const createOrder = async (
  amount,
  currency = "INR",
  receipt = "order_receipt",
  notes = {},
  label = "production"
) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
   
    let existingPayment = await DAO.getOneData(PAYMENT_MODEL, {
      studentId: notes.studentId,
      month: currentMonth,
      status: "pending",
    });

     console.log("existing Payment", existingPayment);
     console.log("notes ",notes);



    if (existingPayment) {
      return {
        id: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        status: existingPayment.status,
        fromDB: true,
      };
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
      notes: { ...notes, label },
    };
    

    const res = await razorpayInstance.orders.create(options);
    console.log("response", res);
    return res;
  } catch (error) {
    logger.error(`Error creating Razorpay order: ${error.message}`);
    throw error;
  }
};

// Verify payment
const verifyPayment = (paymentId, orderId, signature) => {
  try {
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    logger.error(`Error verifying Razorpay payment: ${error.message}`);
    throw error;
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  verifyPayment,
};
