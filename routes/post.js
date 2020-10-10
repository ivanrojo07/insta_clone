const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require("../middleware/requireLogin")
const Post =mongoose.model("Post")

router.get("/all_post",requireLogin,(req,res)=>{
    Post.find().populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
        .then(posts=>{
            return res.status(200).json({posts:posts})
        })
        .catch(err=>{
            return res.status(422).json({error:err})
        })
})

router.post("/create_post",requireLogin,(req,res)=>{
    const {title,body,url} = req.body
    if(!title || !body || !url){
        return res.status(422).json({error:"Please add all the fields"})
    }
    console.log(req.user)
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:url,
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
    console.log(req.id)
    Post.find({postedBy:req.id})
        .populate("postedBy","_id name")
        .populate("comments.postedBy","_id name")
        .then(posts=>{
            // console.log(posts)
            return res.status(200).json({posts:posts})
        })
        .catch(err=>{
            return res.status(422).json({error:err})
        })
})

router.put("/like", requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{
            likes:req.id
        }
    },
    {
        new:true
    }).populate("postedBy","_id name").populate("comments.postedBy","_id name").exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            return res.status(200).json(result)
        }
    })
})

router.put("/unlike", requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{
            likes:req.id
        }
    },
    {
        new:true
    }).populate("postedBy","_id name").populate("comments.postedBy","_id name").exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            return res.status(200).json(result)
        }
    })
})

router.put("/comment", requireLogin,(req,res)=>{
    if(!req.body.text){
        return response.json(422).json({error:"Text required"})
    }
    const comment = {
        text:req.body.text,
        postedBy:req.id
    }

    Post.findByIdAndUpdate(req.body.postId,{
        $push:{
            comments:comment
        }
    },{
        new:true
    }).populate("postedBy","_id name").populate("comments.postedBy","_id name").exec((error,result)=>{
        if(error){
            return res.status(422).json(error)
        }
        else{
            return res.status(201).json(result)
        }
    })
})

router.delete("/deleted_post/:postId",requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id name").populate("comments.postedBy","_id name")
    .exec((err,post)=>{
        if (err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.id.toString()){
            post.remove().then(result=>{
                return res.status(200).json(result)
            }).catch(err=>{
                console.log(err)
            })
        }
        else{
            return res.status(422).json({error:"You not have the permission to delete this post"})
        }
    })
})
module.exports = router