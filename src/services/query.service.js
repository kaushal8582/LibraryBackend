const DAO = require("../dao");

const { QUERY_MODEL } = require("../utils/constants");

const requestQuery = async (payload) => {
  try {

    if(!payload.name) throw new Error("Please enter your name.");
    if(!payload.email) throw new Error("Please enter your email.");
    if(!payload.message) throw new Error("Please enter your message.");

    
    const queryData = await DAO.createData(QUERY_MODEL, payload);

 
       if(!queryData){
            throw new Error("failed query.");
        }
        return queryData;
  } catch (error) {
    console.log(error);
  }
};


const getQueries = async (query = {},projection = {},options = {limit:10}) => {
  try {


    const queries = await DAO.getManyData(QUERY_MODEL,query,projection,options);

    if (!queries) {
      throw new Error("No queries found.");
    }


    return queries;
  } catch (error) {
    console.log(error);
  }
};

const getQueryById = async (query = {},projection = {},options = {}) => {
  try {
    const query = await DAO.getData(QUERY_MODEL, query,projection,options);
    if (!query) {
      throw new Error("Query not found.");
    }
    return query;
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
  requestQuery,
  getQueries,
  getQueryById,
};
