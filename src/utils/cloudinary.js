//This code uploads a file from your computer to Cloudinary.
// If the upload is successful, it gives you the URL of the file on Cloudinary.
// If it fails, it deletes the file from your computer to clean up.
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// this sets up cloudinary with our credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successful
        console.log("file is uploaded on cloudinary",response.url)
        return response
    } catch (error) {
        // it removes the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}