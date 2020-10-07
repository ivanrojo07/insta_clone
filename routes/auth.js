const express = require("express")

const mongoose = require("mongoose")
const User = mongoose.model("User")
const requireLogin = require("../middleware/requireLogin")


const router = express.Router()

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../keys")


router.get('/',(req,res)=>{
    res.send("hello ")
})

router.get('/protected',requireLogin,(req,res)=>{
    console.log(req.user,req.id)
    return res.status(200).json({user:req.user,id:req.id,"message":"Welcome"})
})

router.post("/signup",(req,res)=>{
    // console.log(req.body.name)
    // res.send(req.body.name)
    const {name,email,password} = req.body
    if(!email || !password || !name){
        return res.status(422).json({"error":"please add all the field"})
    } 
    User.findOne({email:email})
        .then((savedUser)=>{
            if(savedUser){
                return res.status(422).json({'error':"User already exists"})
            }

            bcrypt.hash(password,12)
                .then(hashed_password=>{
                    const user = new User({
                        "email":email,
                        "name":name,
                        "password": hashed_password
                    })
                    user.save()
                        .then(user=>{
                            return res.status(201).json({'message':"saved successfuly"})
                        })
                        .catch(err=>{
                            return res.status(422).json({'error':err})
                        })
                })
                .catch(err=>{
                    return res.status(422).json({'error':err})
                })
            
        })
        .catch(err=>{
            return res.status(422).json({'error':err})
        })
})

router.post("/signin",(req,res)=>{
    const {email, password} = req.body
    if (!email || !password ){
        return res.status(422).json({'error':"Please add email or password"})

    }
    User.findOne({email:email})
        .then(savedUser=>{
            if(!savedUser){
                return res.status(422).json({"error":"Email not found"})
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch=>{
                    if(doMatch){
                        // return res.status(200).json({message:"Login successfuly"})
                        const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                        return res.status(200).json({token:token})
                    }
                    else{
                        return res.status(422).json({error:"Password incorrect"})
                    }
                })
                .catch(err=>res.status(422).json({error:err}))
        })
        .catch(err=>res.status(422).json({error:err}))
})
module.exports = router