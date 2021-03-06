const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require('../config/keys')
const mongoose = require('mongoose')
const User = mongoose.model("User")

module.exports = (req,res,next)=>{
    // console.log()
    const {token} = req.cookies
    if(!token){
        return res.status(401).json({error:"Unauthization"})
    } 
    jwt.verify(token, JWT_SECRET, (err, payload)=>{
        if (err){
            return res.status(404).json({error:"You must be a logged in"})
        }
        const {_id} = payload
        User.findById(_id)
            .then(user_data=>{
                req.user = user_data,
                req.id = _id
                next()
            }).catch(error=>{
                return res.status(404).json({error:"Unauthotization, user not find"})
            })
    })
}