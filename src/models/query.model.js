
const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
       
    },
    message:{
        type:String,
        required:true,
    },
},{timestamps:true});


const QueryModel = mongoose.model("Query",querySchema);

module.exports = QueryModel;
