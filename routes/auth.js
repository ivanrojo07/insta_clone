const express = require("express")

const mongoose = require("mongoose")
const User = mongoose.model("User")
const requireLogin = require("../middleware/requireLogin")


const router = express.Router()

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {JWT_SECRET, EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD} = require("../config/keys")
const crypto = require("crypto")

const nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth:{
        user : EMAIL_USER,
        pass : EMAIL_PASSWORD
    }
})



router.get('/',(req,res)=>{
    var mailOptions = {
        from : EMAIL_USER,
        to : "ivanrojo07@gmail.com",
        subject : "Mensaje de prueba",
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    }
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.log(error)
        }
        else{
            console.log("email sent: "+info.response)
        }
    })
    res.send("hello ")
    
})

router.get('/protected',requireLogin,(req,res)=>{
    console.log(req.user,req.id)
    return res.status(200).json({user:req.user,id:req.id,"message":"Welcome"})
})

router.post("/signup",(req,res)=>{
    // console.log(req.body.name)
    // res.send(req.body.name)
    const {name,email,password,pic} = req.body
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
                        "password": hashed_password,
                        "pic":pic
                    })
                    user.save()
                        .then(user=>{
                            var mailOptions = {
                                from : EMAIL_USER,
                                to : user.email,
                                subject : "Signup success",
                                // text: "Hello world?", // plain text body
                                html: "<h1>Welcome to instagram</h1>", // html body
                            }
                            transporter.sendMail(mailOptions,(error,info)=>{
                                if(error){
                                    console.log(error)
                                }
                                else{
                                    console.log("email sent: "+info.response)
                                }
                            })
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

router.post("/logout",requireLogin,(req,res)=>{
    res.clearCookie("token")
    return res.status(200).json({message:"success"})
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
                        res.cookie('token',token,{httpOnly:true})
                        const {_id,name,email,followers,following,pic}= savedUser
                        return res.status(200).json({token:token,user:{_id,name,email,followers,following,pic}})
                    }
                    else{
                        return res.status(422).json({error:"Password incorrect"})
                    }
                })
                .catch(err=>res.status(422).json({error:err}))
        })
        .catch(err=>res.status(422).json({error:err}))
})

router.post("/reset-password",(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
            .then((user)=>{
                if(!user){
                    return res.status(422).json({error:"User dont exists with that email"})
                }
                user.reset_token = token
                user.expire_token = Date.now() + 3600000
                user.save().then((result)=>{
                    var mailOptions = {
                        from : "no-reply@prueba.com",
                        to : user.email,
                        subject : "Password Reset",
                        // text: "Hello world?", // plain text body
                        html: `<p>You requestd for password reset</p>
                        <h5>Click in this <a href="http://localhost:3000/reset_password/${user.reset_token}">link</a> to reset</h5>`, // html body
                    }
                    transporter.sendMail(mailOptions,(error,info)=>{
                        if(error){
                            console.log(error)
                        }
                        else{
                            console.log("email sent: "+info.response)
                        }
                    })
                    return res.status(201).json({message:"Check you email"})
                })
            })
    })
})


router.post("/new-password",(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({reset_token:sentToken,expire_token:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again, session expired"})
        }
        else{
            bcrypt.hash(newPassword,12).then(hashedPassword=>{
                user.password = hashedPassword
                user.reset_token = undefined
                user.expire_token = undefined
                user.save().then((savedUser)=>{
                    return res.status(201).json({message:"password updated success"})
                })
            })
        }
    })
    .catch((error)=>{
        console.log(error)
        return res.status(422).json({error:"Internal error, please try again"})
    })
})
module.exports = router