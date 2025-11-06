'use strict';

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'return', 'other'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'both'],
    default: 'email'
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;