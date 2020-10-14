const { response } = require("express")
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const requireLogin = require("../middleware/requireLogin")
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get("/user/:id",requireLogin,(req,res)=>{
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

router.put('/follow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $push:{
                following:req.body.followId
            },
        
        },{
            new: true
        }).select("-password").then(data=>{
            return res.status(200).json(data)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })

    })
})

router.put('/unfollow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $pull:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{
                following:req.body.followId
            },
        
        },{
            new: true
        }).select("-password").then(data=>{
            return res.status(200).json(data)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })

    })
})

router.put("/update_pic",requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.id,{
        $set:{
            pic:req.body.pic
        }
    },
    {
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:"pic can't post"})
        }
        return res.status(201).json(result)
    })
})

router.post("/search-users",requireLogin,(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
        .select("_id email name")
        .then(user=>{
            return res.status(200).json({user})
        }).catch(err=>{
            console.log(err)
        })
})

module.exports = router