import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async (userId) => {
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       
       user.refreshToken = refreshToken
      //this below line is used so that always password will not be needed or any other params where required field is true 
       await user.save({validateBeforeSave: false})

       return {accessToken,refreshToken}

    } 
    catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    //  get user details from frontend
    // validation - all non empty
    // check if user already exists: username,email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName,email,username,password} = req.body
    if([fullName,email,username,password].some((field) => field?.trim() === ""))
        {
            throw new ApiError(400,"full name is required")
        }
    // console.log("req.body",req.body)
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    // console.log(req.files)
    console.log("existeduser",existedUser)
    if(existedUser) {throw new ApiError(409,"User with email or username already exists")
}
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const converLocalPath = req.files?.coverImage?.[0]?.path;
    let converLocalPath;
    // this Array.isArray checks that is it array or not
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        converLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400,"Avatar file is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(converLocalPath)
    // console.log("avatar",avatar)
    if(!avatar) throw new ApiError(400,"avatar is required")

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // console.log("user",user)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // console.log("usercreate",createdUser)
    if(!createdUser) throw new ApiError(500,"Something went wrong while registering the user")
    
    return res.status(201).json(new ApiResponse(200,createdUser,"User registered Successfully"))
})  


const loginUser = asyncHandler(async(req,res)=> {
    // req body -> data
    // check if user or email is registered first
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const {email,username,password} = req.body

    if(!username && !email) {
        throw new ApiError(400,"username or password is required")
    }

    const user = await User.findOne({$or: [{email},{username}]})

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401,"Invalid User Credentials")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        // this allow us to modify cookies only from the server
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,
            refreshToken
        },
        "User logged In Successfully"
    )
    )
})


const logOutUser = asyncHandler(async(req,res)=>{
    // clear all the cookies
    // reset the refreshToken

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=> {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorised request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id)

    if(!user){
     throw new ApiError(401,"Invalid refresh token")
    }
 
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"Refresh token is expired or used")
    }
 
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken()
 
    const options = {
     httpOnly : true,
     secure: true
    }
    // By issuing a new access token in the refresh endpoint, you ensure the user stays logged in without forcing them to sign in again.
    // refresh token is also changed so that if an attacker stole the access token then it can also stole refresh token so it is much needed to also change the refresh token
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(new ApiResponse(
             200,
             {accessToken, refreshToken: newRefreshToken},
             "Access token refreshed"
         )
     )
   } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
   }
})
export {registerUser,loginUser,logOutUser,refreshAccessToken}