const { successResponse, errorResponse } = require("../utils/responseHandler");
const {requestQuery,getQueries} = require("../services/query.service");

const addQuery = async (req, res) => {
  const payload = req.body;

  const addQueryData = await requestQuery(payload);

   successResponse(res, "request successfully", addQueryData);
  try {
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
const getQuery = async (req, res) => {

  const queries = await getQueries();

   successResponse(res, "request successfully", queries);
  try {
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  addQuery,
  getQuery
};
