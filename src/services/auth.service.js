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
  const { name, email, password, phoneNo, libraryName, role } = userData;

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim();

  // Check BOTH library and user existence FIRST before creating anything
  // This prevents race conditions
  const [existingLibrary, existingUser] = await Promise.all([
    DAO.getOneData(LIBRARY_MODEL, {
      contactEmail: normalizedEmail,
    }),
    DAO.getOneData(USER_MODEL, { email: normalizedEmail }),
  ]);

  if (existingLibrary) {
    throw new Error(ERROR_CODES.LIBRARY_ALREADY_EXISTS.message);
  }

  if (existingUser) {
    throw new Error(ERROR_CODES.USER_ALREADY_EXISTS.message);
  }

  // Hash password before creating anything
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create library first
  let createLibrary;
  try {
    createLibrary = await DAO.createData(LIBRARY_MODEL, {
      name: libraryName.trim(),
      contactEmail: normalizedEmail,
      contactPhone: phoneNo?.trim() || "",
    });
  } catch (error) {
    // Handle duplicate key error (race condition caught by unique index)
    if (error.code === 11000 || error.message?.includes('duplicate key')) {
      // Check again if library was created by another request
      const checkLibrary = await DAO.getOneData(LIBRARY_MODEL, {
        contactEmail: normalizedEmail,
      });
      if (checkLibrary) {
        throw new Error(ERROR_CODES.LIBRARY_ALREADY_EXISTS.message);
      }
      throw new Error("Registration failed. Please try again.");
    }
    throw error;
  }

  if (!createLibrary || !createLibrary[0]) {
    throw new Error("Failed to create library");
  }

  // Create user with library ID
  let result;
  try {
    result = await DAO.createData(USER_MODEL, {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phoneNo?.trim() || "",
      libraryId: createLibrary[0]._id,
      role: "librarian",
    });
  } catch (error) {
    // If user creation fails, try to clean up the library
    // (optional - you might want to keep it for admin review)
    if (error.code === 11000 || error.message?.includes('duplicate key')) {
      const checkUser = await DAO.getOneData(USER_MODEL, { email: normalizedEmail });
      if (checkUser) {
        throw new Error(ERROR_CODES.USER_ALREADY_EXISTS.message);
      }
    }
    throw error;
  }

  if (!result || !result[0]) {
    throw new Error("Failed to create user");
  }

  return result[0];
};

// Login user
const login = async (emailOrUsername, password, role, libraryId) => {
  // For students, use username; for others, use email
  let user;
  if (role === "student") {
    // Find user by username for students
    user = await User.findOne({ username: emailOrUsername }).select("+password");
  } else {
    // Find user by email for librarians/admins
    user = await User.findOne({ email: emailOrUsername }).select("+password");
  }

  if (!user) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

  // Check role
  if (role && user.role !== role) {
    throw new Error(ERROR_CODES.INVALID_CREDENTIALS.message);
  }

  // For students, libraryId is already associated with their account, no need to check
  // Removed libraryId check for students as they're already linked to a library

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
      username: user.username,
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
          username: 1,
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

// Check username availability
const checkUsernameAvailability = async (username, userId) => {
  try {
    if (!username || username.length < 3) {
      return { available: false, message: "Username must be at least 3 characters" };
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return { available: false, message: "Username can only contain lowercase letters, numbers, and underscores" };
    }

    // Check if username already exists (excluding current user)
    const query = { username: username.toLowerCase().trim() };
    if (userId) {
      query._id = { $ne: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId };
    }
    
    const existingUser = await DAO.getOneData(USER_MODEL, query);

    if (existingUser) {
      return { available: false, message: "Username already exists" };
    }

    return { available: true, message: "Username is available" };
  } catch (error) {
    return { available: false, message: error.message };
  }
};

// Update username
const updateUsername = async (newUsername, userId) => {
  try {
    if (!newUsername) throw new Error("Username is required");
    
    // Validate username format
    if (!/^[a-z0-9_]+$/.test(newUsername)) {
      throw new Error("Username can only contain lowercase letters, numbers, and underscores");
    }
    
    if (newUsername.length < 3 || newUsername.length > 30) {
      throw new Error("Username must be between 3 and 30 characters");
    }

    // Check if username already exists
    const existingUser = await DAO.getOneData(USER_MODEL, { 
      username: newUsername.toLowerCase().trim(),
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      throw new Error("Username already exists. Please choose a different username.");
    }

    // Update username
    await DAO.updateData(
      USER_MODEL,
      { _id: userId },
      { username: newUsername.toLowerCase().trim() }
    );

    return {
      message: "Username updated successfully",
      username: newUsername.toLowerCase().trim()
    };
  } catch (error) {
    throw new Error(error.message);
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
  updateUsername,
  checkUsernameAvailability,
};
