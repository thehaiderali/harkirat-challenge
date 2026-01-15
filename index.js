import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRouter from "./routes/auth.routes.js"
dotenv.config()
const app=express()
app.use(express.json())
app.use("/auth",authRouter)
const port = process.env.PORT || 3000
global.activeSession=null;
app.listen(port,async()=>{
    console.log("Server Started at port  : ",port)
    try {
       await mongoose.connect(process.env.MONGO_URI)
       console.log("DataBase Connected Successfully")
    } catch (error) {
        console.log("DataBase Connection Failed")
        console.log("Error : ",error)
    }
})







