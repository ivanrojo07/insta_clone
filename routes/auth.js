const express = require("express")

const mongoose = require("mongoose")
const User = mongoose.model("User")


const router = express.Router()

const bcrypt = require("bcryptjs")

router.get('/',(req,res)=>{
    res.send("hello ")
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

module.exports = router