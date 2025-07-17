import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new mongoose.Schema({
    videoFile : {
        type: String, //cloudinary url
        required: true
    },
    thumbnail : {
        type: String, //cloudinary url
        required: true
    },
    title : {
        type: String, 
        required: true
    },
    description : {
        type: String, 
        required: true
    },
    duration : {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})
// this pagination means show data in pages like 10 items per page on the basis of either uploadDate,views,owner
// this plugin is used to adds pagination support 
// this aggregate pipeline is just a sequence of steps that mongodb runs one by one

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",VideoSchema)