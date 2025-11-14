'use strict';

const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Create payment order controller
const createPaymentOrder = async (req, res) => {
  try {
    const { studentId, libraryId, amount, currency, description, month } = req.body;
    console.log("req body",req.body);
    const userId = req.user._id;
    
    const result = await paymentService.createPaymentOrder({
      studentId,
      libraryId,
      amount,
      currency: currency || 'INR',
      description,
      month,
      userId
    });
    
    return successResponse(res, 'Payment order created successfully', result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Verify payment controller
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    const result = await paymentService.verifyPayment({
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature
    });
    
    return successResponse(res, 'Payment verified successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get payments by student controller
const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await paymentService.getPaymentsByStudent(studentId);
    
    return successResponse(res, 'Payments retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Get payments by library controller
const getPaymentsByLibrary = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const {lastDays} =  req.query || 30;
    const result = await paymentService.getPaymentsByLibrary(libraryId,lastDays);
    
    return successResponse(res, 'Payments retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Get payment by ID controller
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await paymentService.getPaymentById(id);
    
    return successResponse(res, 'Payment retrieved successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Process refund controller
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;
    
    const result = await paymentService.processRefund(id, {
      amount,
      reason,
      userId
    });
    
    return successResponse(res, 'Refund processed successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentsByStudent,
  getPaymentsByLibrary,
  getPaymentById,
  processRefund
};