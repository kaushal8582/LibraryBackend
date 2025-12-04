'use strict';

const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Library name is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'expired'],
    default: 'pending'
  },
  subscriptionEndDate: {
    type: Date
  },
  heroImg:{
    type : String,
    default :"",
  },
  galleryPhotos : [
    {
      type : String,
      default : ""
    }
  ],
  openingHours: {
    type: String,
    
  },
  closingHours: {
    type: String,
    
  },
  openFDays: [
    {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: 'monday'
    }
  ],
  plans:[{
    hours : {
      type : Number,
      default : 0
    },
    price : {
      type : Number,
      default : 0
    },
  }],
  services :[
    {
      type : String,
      default : ""
    }
  ],
  settings: {
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'none'],
      default: 'razorpay'
    },
    notificationChannels: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;