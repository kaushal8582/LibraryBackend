const express = require("express");
const { addQueryValidator } = require("../validators/query.validator");
const validateRequest = require("../middleware/validateRequest");
const { addQuery,getQuery } = require("../controllers/query.controller");



const router = express.Router();

router.post("/add",validateRequest(addQueryValidator), addQuery);
router.get("/", getQuery);

module.exports = router;