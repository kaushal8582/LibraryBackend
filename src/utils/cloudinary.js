import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"


dotenv.config({
  path:"./.env"
})

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
})




const uploadOnCloudinary = async(localFilePath)=>{
  try {
    if(!localFilePath) return null;
    console.log(localFilePath);

    const fileExtension = localFilePath.split('.').pop().toLowerCase();
    let resourceType = "auto";

    if (fileExtension === "pdf") {
      resourceType = "raw";
    }
    
    const response = await cloudinary.uploader.upload(localFilePath,{
      resource_type:resourceType
    })

    
    return response;
    
    
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log(error.message);
    
    return null
  }
}

export default uploadOnCloudinary;