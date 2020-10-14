const express = require('express')

const app = express()
const PORT = 5000


const mongoose = require('mongoose')
const {MONGOURI} = require('./config/keys')

const cookieParser = require("cookie-parser")

mongoose.connect(MONGOURI,{
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false 
})
mongoose.connection.on('connected',()=>{
    console.log("connected to mongodb")
})
mongoose.connection.on('error',(error)=>{
    console.log("error connection", error)
})
// 7D53ZgvEUbiGOuSt

require("./models/user")
require("./models/post")
app.use(cookieParser());

const auth_routes = require("./routes/auth")
const post_routes = require("./routes/post")
const user_routes = require("./routes/user")

if(process.env.NODE_ENV === "production"){
    app.use(express.static("client/build"))
    const path= require("path")
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"client","build","index.html"))
    })
}

app.use(express.json())
app.use([auth_routes,post_routes, user_routes])

app.listen(PORT,()=>{
    console.log("server is running on ",PORT)
})