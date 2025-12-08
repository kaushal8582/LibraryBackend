const DAO = require("../dao");
const { REVIEW_MODEL,LIBRARY_MODEL } = require("../utils/constants");

const addReview = async(payload,user)=>{
    try {
        if(!user){
            throw new Error("User not found");
        }
        const {libraryId,rating,reviewText} = payload;
        const getLibrary = await DAO.getOneData(LIBRARY_MODEL,{_id:libraryId});

        const existingReview = await DAO.getOneData(REVIEW_MODEL,{
            libraryId,
            userId:user._id,
            isDeleted:false,
        });

        if(existingReview){
            throw new Error("Review already exists");
        }
        


        if(!getLibrary){
            throw new Error("Library not found");
        }
        const reviewData = {
            libraryId,
            userId:user._id,
            rating,
            reviewText,
        }
        
        const addReview = await DAO.createData(REVIEW_MODEL,reviewData);
       
        if(!addReview){
            throw new Error("Review not added");
        }
        return addReview;
    } catch (error) {
        console.log(error.message);
    }
}

const updateReview = async(payload,user)=>{
    try {
        if(!user){
            throw new Error("User not found");
        }
        const {reviewId,rating,reviewText} = payload;
        const getReview = await DAO.getOneData(REVIEW_MODEL,{_id:reviewId});
        if(!getReview){
            throw new Error("Review not found");
        }
        if(getReview.userId.toString() !== user._id.toString()){
            throw new Error("You are not authorized to update this review");
        }
        const updateReview = await DAO.updateData(REVIEW_MODEL,{_id:reviewId},{
            rating,
            reviewText,
        });
        if(!updateReview){
            throw new Error("Review not updated");
        }
        return updateReview;
    } catch (error) {
        console.log(error.message);
    }
}

const deleteReview = async(payload,user)=>{
    try {
        if(!user){
            throw new Error("User not found");
        }
        const {reviewId} = payload;
        const getReview = await DAO.getOneData(REVIEW_MODEL,{_id:reviewId});
        if(!getReview){
            throw new Error("Review not found");
        }
        if(getReview.userId.toString() !== user._id.toString()){
            throw new Error("You are not authorized to delete this review");
        }
        const deleteReview = await DAO.updateData(REVIEW_MODEL,{_id:reviewId},{
            isDeleted:true,
        });
        if(!deleteReview){
            throw new Error("Review not deleted");
        }
        return deleteReview;
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    addReview,
    updateReview,
    deleteReview,
}

