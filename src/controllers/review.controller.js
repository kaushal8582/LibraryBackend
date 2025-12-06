const {
  addReview,
  updateReview,
  deleteReview,
} = require("../services/review.service");
const { successResponse, errorResponse } = require("../utils/responseHandler");

const addReviewController = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;
    console.log("user payload", user,payload);
    const addReviewData = await addReview(payload, user);
    return successResponse(res, "Review added successfully", addReviewData);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updateReviewController = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;
    const updateReviewData = await updateReview(payload, user);
    return successResponse(
      res,
      "Review updated successfully",
      updateReviewData
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const deleteReviewController = async (req, res) => {
  try {
    const user = req.user;
    const payload = req.body;
    const deleteReviewData = await deleteReview(payload, user);
    return successResponse(
      res,
      "Review deleted successfully",
      deleteReviewData
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};


module.exports = {
  addReviewController,
  updateReviewController,
  deleteReviewController,
};