"use strict";

const DAO = require("../dao");
const mongoose = require("mongoose");
const {
  PAYMENT_MODEL,
  STUDENT_MODEL,
  LIBRARY_MODEL,
  USER_MODEL,
} = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");
const {
  createOrder,
  verifyPayment: verifyRazorpaySignature,
  razorpayInstance,
} = require("../utils/razorpayClient");
const logger = require("../config/logger");

// Create payment order
const createPaymentOrder = async (paymentData) => {
  try {
    const {
      studentId,
      libraryId,
      amount,
      currency,
      description,
      month,
      userId,
    } = paymentData;
    console.log("payment data", paymentData);

    // Validate student exists
    const student = await DAO.getOneData(STUDENT_MODEL, { userId: userId });
    console.log("student", student);
    if (!student) {
      throw new Error(ERROR_CODES.STUDENT_NOT_FOUND.message);
    }

    // Validate library exists
    const library = await DAO.getOneData(LIBRARY_MODEL, { _id: libraryId });
    if (!library) {
      throw new Error(ERROR_CODES.LIBRARY_NOT_FOUND.message);
    }

    // Create Razorpay order
    const receipt = `receipt_${Date.now()}`;
    const notes = {
      studentId: studentId.toString(),
      libraryId: libraryId.toString(),
      month: month || new Date().toISOString().slice(0, 7),
      userId: userId.toString(),
      description: description || "Library subscription payment",
    };

    const totalAmount = student.fee;

    const razorpayOrder = await createOrder(
      totalAmount,
      currency,
      receipt,
      notes,
      "production"
    );

    // Create payment record in database
    const paymentDataToSave = {
      studentId,
      libraryId,
      amount:totalAmount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
      description: description || "Library subscription payment",
      month: month || new Date().toISOString().slice(0, 7),
      paymentMethod: "razorpay",
    };

    if (razorpayOrder?.fromDB) {
      const updatedPayment = await DAO.updateData(
        PAYMENT_MODEL,
        { razorpayOrderId: razorpayOrder?.id },
        {
          $set: {
            status: "pending",
          },
        }
      );

      return {
        payment: updatedPayment,
        razorpayOrder,
      };
    } else {
      const payment = await DAO.createData(PAYMENT_MODEL, paymentDataToSave);
      return {
        payment: payment[0],
        razorpayOrder,
      };
    }
  } catch (error) {
    console.log("Error while Creating Order ", error);
  }
};

// Verify payment
const verifyPayment = async (paymentData) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      paymentData;

    // Find payment by Razorpay order ID
    const payment = await DAO.getOneData(PAYMENT_MODEL, { razorpayOrderId });
    if (!payment) {
      throw new Error("Payment order not found");
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    );

    if (!isValidSignature) {
      // Update payment status to failed
      await DAO.updateData(
        PAYMENT_MODEL,
        { _id: payment._id },
        {
          status: "failed",
          razorpayPaymentId,
        }
      );
      throw new Error("Invalid payment signature");
    }

    console.log("iscalidSignature ", isValidSignature);

    // Update payment status to completed
    const updatedPayment = await DAO.updateData(
      PAYMENT_MODEL,
      { _id: payment._id },
      {
        $set: {
          status: "completed",
          razorpayPaymentId,
          paymentDate: new Date(),
        },
      }
    );

    const studetnData = await DAO.getOneData(STUDENT_MODEL, {
      userId: updatedPayment.studentId,
    });

    const nextDueDate = new Date(studetnData?.nextDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const updateStudetn = await DAO.updateData(
      STUDENT_MODEL,
      { _id: studetnData._id },
      {
        $set: {
          nextDueDate,
          isPaymentDoneForThisMonth: true,
        },
      }
    );

    console.log("updatePymf", updatedPayment, updateStudetn);

    return updatedPayment;
  } catch (error) {
    console.log("Error in verify Payment ", verifyPayment);
  }
};

// Get payments by student
const getPaymentsByStudent = async (studentId) => {
  try {
    if (!studentId) throw new Error("Student ID is required");

    const aggregate = [
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $group: {
          _id: null,
          payments: { $push: "$$ROOT" },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
            },
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPaid: 1,
          totalPending: 1,
          totalAmount: 1,
          payments: 1,
        },
      },
    ];

    const payments = await DAO.aggregateData(PAYMENT_MODEL, aggregate);

    // if (!payments || payments.length === 0) {
    //   throw new Error("No payments found for this student");
    // }

    return payments?.[0];
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw new Error(error.message);
  }
};

// Get payments by library
const getPaymentsByLibrary = async (libraryId, lastDays = 30) => {
  const matchQuery = {
    libraryId: new mongoose.Types.ObjectId(libraryId),
    paymentDate: {
      $gte: new Date(Date.now() - lastDays * 24 * 60 * 60 * 1000),
    },
  };

  const aggregate = [
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "userId",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "student.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        amount: 1,
        currency: 1,
        paymentDate: 1,
        paymentMethod: 1,
        razorpayPaymentId: 1,
        razorpayRefundId: 1,
        refundAmount: 1,
        refundReason: 1,
        refundDate: 1,
        month: 1,
        razorpayOrderId: 1,
        status: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        studentId : 1,

        student: {
          _id: "$student._id",
          fee: "$student.fee",
          nextDueDate: "$student.nextDueDate",
          isPaymentDoneForThisMonth: "$student.isPaymentDoneForThisMonth",
        },
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];

  const payments = await DAO.aggregateData(PAYMENT_MODEL, aggregate);

  console.log("payments ", payments);

  if (!payments || payments.length === 0) {
    throw new Error("No payments found for this library");
  }

  return payments;
};

// Get payment by ID
const getPaymentById = async (id) => {
  const payment = await DAO.getOneData(PAYMENT_MODEL, { _id: id });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

// Process refund
const processRefund = async (paymentId, refundData) => {
  const { amount, reason, userId } = refundData;

  // Find payment
  const payment = await DAO.getOneData(PAYMENT_MODEL, { _id: paymentId });
  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "completed") {
    throw new Error("Only completed payments can be refunded");
  }

  // Process refund through Razorpay
  const refundAmount = amount || payment.amount;

  try {
    const refund = await razorpayInstance.payments.refund(
      payment.razorpayPaymentId,
      {
        amount: refundAmount * 100, // Convert to paise
        notes: {
          reason: reason || "Customer requested refund",
          refundedBy: userId.toString(),
        },
      }
    );

    // Update payment status to refunded
    const updatedPayment = await DAO.updateData(
      PAYMENT_MODEL,
      { _id: paymentId },
      {
        status: "refunded",
        refundAmount: refundAmount,
        refundReason: reason,
        refundDate: new Date(),
        razorpayRefundId: refund.id,
      }
    );

    return updatedPayment;
  } catch (error) {
    logger.error(`Error processing refund: ${error.message}`);
    throw new Error("Failed to process refund: " + error.message);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentsByStudent,
  getPaymentsByLibrary,
  getPaymentById,
  processRefund,
};
