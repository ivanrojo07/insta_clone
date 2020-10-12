const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require("../middleware/requireLogin")
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get("/user/:id",requireLogin,(req,res)=>{
    console.log(req.params.id)
    User.findOne({
        _id:req.params.id
    }).select("-password").then(user=>{
        Post.find({postedBy:user._id})
            .populate("postedBy","_id name")
            .exec((err,posts)=>{
                if(err){
                    return res.status(422).json({
                        error:err
                    })
                }
                else{
                    return res.status(200).json({user,posts})
                }
            })
    }).catch(err=>{
        console.log(err)
        return res.status(404).json({error:"User not found"})
    })
})

module.exports = router