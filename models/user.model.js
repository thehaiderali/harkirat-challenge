import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true  
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["teacher","student"],
        required:true
    }
})


export const User=mongoose.model("User",userSchema)