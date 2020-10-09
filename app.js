const express = require('express')

const app = express()
const PORT = 5000


const mongoose = require('mongoose')
const {MONGOURI} = require('./keys')

const cookieParser = require("cookie-parser")

mongoose.connect(MONGOURI,{
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useCreateIndex: true
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
app.use(express.json())
app.use([auth_routes,post_routes])

app.listen(PORT,()=>{
    console.log("server is running on ",PORT)
})