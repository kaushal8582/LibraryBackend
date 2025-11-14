"use strict";

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fee: {
      type: String,
      required: true,
    },
    timing: {
      type: String,
      optional: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    isPaymentDoneForThisMonth: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
