'use strict';

const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const sendEmail = require('../utils/sendMail');
const redisClient = require("../lib/redis")
// Register controller
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password, role, libraryId } = req.body;
    const result = await authService.login(email, password, role, libraryId);
    return successResponse(res, 'Login successful', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Refresh token controller
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, 'Token refreshed successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};
const getInfo = async (req, res) => {
  try {

  //  await sendEmail("kaushal@snabbtech.com","Test Email","<h1>Test Email</h1>")

    const userId = req.userId;
    const result = await authService.userInfo(userId);
    return successResponse(res, 'User Info Get Successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Update password controller
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;
    const result = await authService.updatePassword(oldPassword, newPassword, userId);
    return successResponse(res, 'Password updated successfully', result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const forgetPassword = async (req,res)=>{
  try {

    const {email} = req.body;
    if(!email)
      throw new Error("email is required");

    const result = await authService.forgotPassword(email);

return successResponse(res, 'successfully', result);
    
  } catch (error) {
     return errorResponse(res, error.message, 400);
  }

}



const resetPassword = async (req,res)=>{
  try {
    const {token,password} = req.body;

    console.log(req.body);

    const result = await authService.resetPassword(token,password);
     return successResponse(res, 'Password reseted successfully', result);    
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}



module.exports = {
  register,
  login,
  refreshToken,
  getInfo,
  updatePassword,
  forgetPassword,
  resetPassword
};