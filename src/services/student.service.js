"use strict";

const DAO = require("../dao");
const {
  STUDENT_MODEL,
  LIBRARY_MODEL,
  USER_MODEL,
} = require("../utils/constants");
const { AppError } = require("../utils/errorHandler");
const bcrypt = require("bcryptjs");
const { createOrder } = require("../utils/razorpayClient");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const sendEmail = require("../utils/sendMail");
const { default: uploadOnCloudinary } = require("../utils/cloudinary");

/**
 * Create a new student
 * @param {Object} studentData - Student data
 * @returns {Promise<Object>} Created student
 */
const createStudent = async (studentData, loggedInUser) => {
  try {
    // Check if student already exists
    const existingStudent = await DAO.getOneData(USER_MODEL, {
      email: studentData.email,
      libraryId: loggedInUser?.libraryId,
    });

    if (existingStudent) {
      throw new AppError(
        "Student already exists",
        400,
        "STUDENT_ALREADY_EXISTS"
      );
    }

    const password = Math.random().toString(36).slice(-8);
    const hashPassword = await bcrypt.hash(password, 10);

    const userPayload = {
      name: studentData.name,
      email: studentData.email,
      password: hashPassword,
      role: "student",
      libraryId: loggedInUser?.libraryId,
      phone: studentData.phone,
    };

    const createUser = await DAO.createData(USER_MODEL, userPayload);
    if (!createUser) {
      throw new AppError("Student not created", 400, "USER_NOT_CREATED");
    }

    const nextDueDate = new Date(studentData?.joinDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const payload = {
      joinDate: studentData?.joinDate,
      nextDueDate,
      libraryId: loggedInUser?.libraryId,
      address: studentData?.address,
      fee: studentData?.fee,
      timing: studentData?.timing,
      userId: createUser?.[0]?._id,
    };

   

    // Create student
    const student = await DAO.createData(STUDENT_MODEL, payload);

    if (!student) {
      throw new AppError("Student not created", 400, "STUDENT_NOT_CREATED");
    }

  

    const templatePath = path.join(__dirname, "..", "views", "welcome.ejs");

    const htmlContent = await ejs.renderFile(templatePath, {
      name: studentData.name,
      email: studentData.email,
      password: password,
    });

    await sendEmail(studentData.email, "Welcome", htmlContent);

    return student;
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

/**
 * Get all students
 * @param {Object} filter - Filter criteria
 * @returns {Promise<Array>} List of students
 */
const getAllStudents = async (filter = {}, loggedInUser) => {
  try {
    const libraryId = loggedInUser?.libraryId;
    const { status, search } = filter;

    const searchableFields = ["user.name", "user.email", "user.phone"];

    // Base match
    const matchStage = {
      libraryId,
      isDeleted: false,
    };

    // ✅ Filter by status
    if (status && typeof status === "string" && status.trim() !== "") {
      matchStage.status = status.toLowerCase();
    }

    // Build pipeline
    const aggregatePipeline = [
      { $match: matchStage },

      // 👇 Join with Users collection to get student user info
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 👇 Join with Libraries for reference
      {
        $lookup: {
          from: "libraries",
          localField: "libraryId",
          foreignField: "_id",
          as: "library",
        },
      },
      { $unwind: "$library" },
    ];

    // ✅ Add search filter dynamically (searching in user fields)
    if (typeof search === "string" && search.trim() !== "") {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      aggregatePipeline.push({
        $match: {
          $or: searchableFields.map((field) => ({
            [field]: searchRegex,
          })),
        },
      });
    }

    // ✅ Final projection
    aggregatePipeline.push({
      $project: {
        _id: 1,
        "user._id": 1,
        "user.name": 1,
        "user.email": 1,
        "user.phone": 1,
        joinDate: 1,
        address: 1,
        fee: 1,
        timing: 1,
        status: 1,
        libraryName: "$library.name",
      },
    });

    const res = await DAO.aggregateData("Student", aggregatePipeline);

    return res;
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

/**
 * Get student by ID
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Student
 */
const getStudentById = async (id) => {
  try {
    const aggregate = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.phone": 1,
          joinDate: 1,
          address: 1,
          fee: 1,
          timing: 1,
          status: 1,
        },
      },
    ];

    const student = await DAO.aggregateData(STUDENT_MODEL, aggregate);

    return student?.[0];
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

/**
 * Update student
 * @param {string} id - Student ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated student
 */
const updateStudent = async (id, updateData, req) => {
  try {
    const student = await DAO.getOneData(STUDENT_MODEL, { _id: id });
    const userData = await DAO.getOneData(USER_MODEL, { _id: student?.userId });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }
    const files = req.files?.profileImg?.[0] || null;
    const userModalUpdate = {
      name: updateData.name ? updateData.name : userData?.name,
      email: updateData.email ? updateData.email : userData?.email,
      phone: updateData.phone ? updateData.phone : userData?.phone,
    };

    if (files) {
      const cloudinaryResponse = await uploadOnCloudinary(files.path);
      if (!cloudinaryResponse) {
        throw new AppError(
          "Error while uploading file on cloudinary",
          400,
          "FILE_UPLOAD_ERROR"
        );
      }
      userModalUpdate.avtar = cloudinaryResponse.url;
    }

    await DAO.updateData(USER_MODEL, { _id: student?.userId }, userModalUpdate);

    const payload = {
      joinDate: updateData?.joinDate
        ? new Date(updateData?.joinDate)
        : student?.joinDate,
      address: updateData?.address ? updateData?.address : student?.address,
      fee: updateData?.fee ? updateData?.fee : student?.fee,
      timing: updateData?.timing ? updateData?.timing : student?.timing,
      status: updateData?.status
        ? updateData?.status.toLowerCase()
        : student?.status,
    };

    return DAO.updateData(STUDENT_MODEL, { _id: id }, payload);
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

/**
 * Delete student
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Deleted student
 */
const deleteStudent = async (id) => {
  try {
    const student = await DAO.getOneData(STUDENT_MODEL, { _id: id });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    return DAO.updateData(STUDENT_MODEL, { _id: id }, { isDeleted: true });
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

const uploadImg = async (req) => {
  try {
    const files = req.files?.img?.[0] || null;
   
    if (files) {
      const cloudinaryResponse = await uploadOnCloudinary(files.path);
     
      if (!cloudinaryResponse) {
        throw new AppError(
          "Error while uploading file on cloudinary",
          400,
          "FILE_UPLOAD_ERROR"
        );
      }
      return cloudinaryResponse.url;
    }
    return null;
  } catch (error) {
    throw new AppError(error.message, error.statusCode || 400);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadImg,
};
