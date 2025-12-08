"use strict";

const DAO = require("../dao");
const { USER_MODEL, LIBRARY_MODEL } = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const sendEmail = require("../utils/sendMail");
const generateOTP = require("../lib/generateOTP");
const crypto = require("crypto");
const redisClient = require("../lib/redis");
const config = require("../config/env");
// Register user
const register = async (userData) => {
  // Check if user already exists

  const { name, email, password, phoneNo, libraryName, role } = userData;

  // Check if library already exists
  const existingLibrary = await DAO.getOneData(LIBRARY_MODEL, {
    contactEmail: email,
  });

  if (existingLibrary) {
    throw new Error(ERROR_CODES.LIBRARY_ALREADY_EXISTS.message);
  }

  const createLibrary = await DAO.createData(LIBRARY_MODEL, {
    name: libraryName,
    contactEmail: email,
    contactPhone: phoneNo,
  });

  const existingUser = await DAO.getOneData(USER_MODEL, { email });

  if (existingUser) {
    throw new Error(ERROR_CODES.USER_ALREADY_EXISTS.message);
  }

  // Create user

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await DAO.createData(USER_MODEL, {
    name,
    email,
    password: hashedPassword,
    phone: phoneNo,
    libraryId: createLibrary[0]._id,
    role: "librarian",
  });
  return result[0];
};

// Login user
const login = async (email, password, role, libraryId) => {
  // Find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

  // Check role and libraryId
  if (role && user.role !== role) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

 

  if (role === "student") {
    if (!libraryId && user.libraryId.toString() !== libraryId) {
      throw new Error("Library ID does not match");
    }
  }

  // Update last login
  await DAO.updateData(
    USER_MODEL,
    { _id: user._id },
    { lastLogin: new Date() }
  );

  // Generate tokens
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      libraryId: user.libraryId,
    },
    accessToken,
    refreshToken,
  };
};

// Refresh token
const refreshToken = async (token) => {
  try {
    const jwt = require("jsonwebtoken");
    const { JWT_REFRESH_SECRET } = require("../config/env");

    // Verify refresh token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    // Find user
    const user = await DAO.getOneData(USER_MODEL, { _id: decoded.id });

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND.message);
    }

    // Generate new access token
    const userInstance = await User.findById(user._id);
    const accessToken = userInstance.generateAuthToken();

    return { accessToken };
  } catch (error) {
    throw new Error(ERROR_CODES.INVALID_TOKEN.message);
  }
};

const userInfo = async (userId) => {
  try {
    if (!userId) throw new Error("User not found");
    const aggregate = [
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
      // ✅ Lookup Library Data
      {
        $lookup: {
          from: "libraries",
          localField: "libraryId",
          foreignField: "_id",
          as: "libraryData",
        },
      },
      {
        $unwind: {
          path: "$libraryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // ✅ Lookup Student Data (based on userId)
      {
        $lookup: {
          from: "students",
          localField: "_id", // user _id
          foreignField: "userId", // student.userId
          as: "studentData",
        },
      },
      {
        $unwind: {
          path: "$studentData",
          preserveNullAndEmptyArrays: true, // in case user is not a student
        },
      },
      // ✅ Project only necessary fields
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          phone: 1,
          isActive: 1,
          lastLogin: 1,
          createdAt: 1,
          libraryId: 1,
          avtar: 1,
          bio:1,

          // library info
          "libraryData._id": 1,
          "libraryData.name": 1,
          "libraryData.contactEmail": 1,
          "libraryData.contactPhone": 1,
          "libraryData.subscriptionStatus": 1,
          "libraryData.settings": 1,
          "libraryData.isActive": 1,
          "libraryData.createdAt": 1,
          "libraryData.address": 1,
          "libraryData.heroImg": 1,
          "libraryData.galleryPhotos": 1,
          "libraryData.openingHours": 1,
          "libraryData.closingHours": 1,
          "libraryData.openForDays": 1,
          "libraryData.plans": 1,
          "libraryData.facilities": 1,
          "libraryData.aboutLibrary": 1,
        

          // student info
          "studentData._id": 1,
          "studentData.status": 1,
          "studentData.userId": 1,
          "studentData.libraryId": 1,
          "studentData.joinDate": 1,
          "studentData.address": 1,
          "studentData.fee": 1,
          "studentData.timing": 1,
          "studentData.nextDueDate": 1,
          "studentData.isPaymentDoneForThisMonth": 1,
        },
      },
    ];

    const userWithAllData = await DAO.aggregateData(USER_MODEL, aggregate);
   

    return userWithAllData?.[0] || null;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error.message);
  }
};

const updatePassword = async (oldPassword, newPassword, userId) => {
  try {
    const user = await DAO.getOneData(USER_MODEL, { _id: userId });
    if (!user) throw new Error("User not found");


    // Check password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await DAO.updateData(
      USER_MODEL,
      { _id: userId },
      { password: hashedPassword }
    );

    return {
      message: "Password updated successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const forgotPassword = async (email) => {
 
  try {
    const user = await DAO.getOneData(USER_MODEL, { email });

    if (!user)
      throw new Error("Email not registered please enter valid email.");

    const token = crypto.randomBytes(32).toString("hex");

    await redisClient.set(`forgot-password:${token}`, email, "EX", 300);

    const link = `${config.CLIENT_URL}/auth/reset-password/?token=${token}`;

    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "forgotPassword.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name: user.name,
      resetLink: link,
    });

    await sendEmail(email, "Forget password", htmlContent);

    return "We have successfully sent reset link in registered email.";
  } catch (error) {
    throw new Error(error.message);
  }
};

const resetPassword = async (token, password) => {
  try {
    if (!token) throw new Error("Invalid token request new link.");

    if (!password) throw new Error("Password is required");

    const email = await redisClient.get(`forgot-password:${token}`);

    if (!email)
      throw new Error("Invalid link. Please request a new one to proceed");

    const hashedPassword = await bcrypt.hash(password, 10);

    await DAO.updateData(USER_MODEL, { email }, { password: hashedPassword });

    await redisClient.del(`forgot-password:${token}`);

    return "Password has been reseted.";
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  userInfo,
  updatePassword,
  forgotPassword,
  resetPassword,
};
