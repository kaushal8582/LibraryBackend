const DAO = require("../dao");
const mongoose = require("mongoose");
const { REVIEW_MODEL, LIBRARY_MODEL } = require("../utils/constants");

// Recalculate and update avgReview on Library after any review change
const updateLibraryAvgReview = async (libraryId) => {
  try {
    const libObjectId = new mongoose.Types.ObjectId(libraryId);
    const pipeline = [
      { $match: { libraryId: libObjectId, isDeleted: false } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ];
    const result = await DAO.aggregateData(REVIEW_MODEL, pipeline);
    const avg = result.length ? result[0].avg : 0;
    await DAO.updateData(LIBRARY_MODEL, { _id: libObjectId }, { avgRating: Number((avg || 0).toFixed(2)) });
  } catch (_) {
    // swallow to not block review operation; logging can be added if needed
  }
};

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
        // Update library avg after successful add
        await updateLibraryAvgReview(libraryId);
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
        // Update library avg after successful update
        await updateLibraryAvgReview(getReview.libraryId);
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
        // Update library avg after successful delete
        await updateLibraryAvgReview(getReview.libraryId); 
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

