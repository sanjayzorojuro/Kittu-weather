const express = require('express')
const https = require('https')
const fs = require("fs")
const path = require('path')
const app = express();
const port = 3000;
const helmet = require('helmet')

app.use(express.static(path.join(__dirname,'public')))


app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"templates","home.html"));
});

app.get("/dashboard",(req,res)=>{
    res.sendFile(path.join(__dirname,"templates","dashboard.html"))
})

app.get("/forecast",(req,res)=>{
    res.sendFile(path.join(__dirname,"templates","forecast.html"))
})

app.get("/map",(req,res)=>{
    res.sendFile(path.join(__dirname,"templates","map.html"))
})

app.get("/alert",(req,res)=>{
    res.sendFile(path.join(__dirname,"templates","alert.html"))
})

app.listen(port,()=> console.log(`server running on http://localhost:${port}`))