

const express = require("express");
const { addReviewController, updateReviewController, deleteReviewController } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");
const { addRevieValidator,updateRevieValidator } = require("../validators/review.validator");
const validateRequest = require("../middleware/validateRequest");
const router = express.Router();

router.post("/add",protect, validateRequest(addRevieValidator), addReviewController);
router.put("/update", protect,validateRequest(updateRevieValidator), updateReviewController);
router.delete("/delete", protect, deleteReviewController);


module.exports = router;