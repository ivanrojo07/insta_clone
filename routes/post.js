const { response } = require("express")
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require("../middleware/requireLogin")
const Post =mongoose.model("Post")

router.get("/all_post",requireLogin,(req,res)=>{
    Post.find().populate("postedBy","_id name")
        .then(posts=>{
            return res.status(200).json({posts:posts})
        })
        .catch(err=>{
            return res.status(422).json({error:err})
        })
})

router.post("/create_post",requireLogin,(req,res)=>{
    const {title,body} = req.body
    if(!title || !body){
        return res.status(422).json({error:"Please add all the fields"})
    }
    console.log(req.user)
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        postedBy:req.user
    })
    post.save()
        .then(result=>{
            return res.status(201).json({post:result})
        })
        .catch(err=>{
            return res.status(422).json({error:err})
        })
        // return res.status(201).json({message:"ok"})
})


router.get("/my_post", requireLogin, (req,res)=>{
    Post.find({postedBy:req.id})
        .populate("postedBy","_id name")
        .then(posts=>{
            return res.status(200).json({posts:posts})
        })
        .catch(err=>{
            return res.status(422).json({error:err})
        })
})
module.exports = router