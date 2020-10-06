const express = require('express')
const app = express()
const PORT = 5000

const customMiddleware = (req, res, next)=>{
    console.log("middleware executed!!")
    next()
}


// app.use(customMiddleware)

app.get('/',(req,res)=>{
    res.send("hello there!!!")
})

app.get('/about', customMiddleware ,(req,res)=>{
    res.send("about page")
})


app.listen(PORT,()=>{
    console.log("server is running on ",PORT)
})