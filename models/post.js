const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types
const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    photo : {
        type: String,
        // default:"no photo"
        required:true
    },
    postedBy:{
        type : ObjectId,
        ref : "User",
        required : true
    }
})
mongoose.model("Post", postSchema)