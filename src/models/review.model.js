const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true, 
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    default: "",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
},{timestamps:true});

module.exports = mongoose.model("Review", reviewSchema);
