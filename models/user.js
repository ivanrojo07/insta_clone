const mongoose = require("mongoose")
const {ObjectId} = mongoose.Schema.Types
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/de9mcytbc/image/upload/v1602607773/200703104728-labrador-retriever-stock-super-169_kjwwsl.jpg"
    },
    followers:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:ObjectId,
            ref:"User"
        }
    ]
})

mongoose.model("User", userSchema)