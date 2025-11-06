"use strict";

const DAO = require("../dao");
const { USER_MODEL, LIBRARY_MODEL } = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Register user
const register = async (userData) => {
  // Check if user already exists

  const { name, email, password, phoneNo, libraryName } = userData;

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
  });
  return result[0];
};

// Login user
const login = async (email, password) => {
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
    if (!userId) {
      throw new Error("User not founc");
    }

    console.log("user id ",userId);

    const aggregate = [
      {
        $match: { _id:new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "libraries", // 👈 name of your Library collection (check actual name in MongoDB)
          localField: "libraryId",
          foreignField: "_id",
          as: "libraryData",
        },
      },
      {
        $unwind: {
          path: "$libraryData",
          preserveNullAndEmptyArrays: true, // if user has no library, still return user data
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          libraryId : 1,
          phone: 1,
          isActive: 1,
          lastLogin: 1,
          createdAt: 1,
          "libraryData._id": 1,
          "libraryData.name": 1,
          "libraryData.contactEmail": 1,
          "libraryData.contactPhone": 1,
          "libraryData.subscriptionStatus": 1,
          "libraryData.settings": 1,
          "libraryData.isActive": 1,
          "libraryData.createdAt": 1,
          "libraryData.address" : 1,
        },
      },
    ]
    const userWithLibrary = await DAO.aggregateData(USER_MODEL,aggregate);
    console.log(userWithLibrary);

    return userWithLibrary?.[0]
    
  } catch (error) {
    console.log("error ", error);
    throw new Error(error.message);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  userInfo,
};
