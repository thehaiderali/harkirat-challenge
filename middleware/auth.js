import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { tokenSchema } from "../zod/validator.js";
import { User } from "../models/user.model.js";
import { Class } from "../models/class.model.js";
dotenv.config()

export async function authMiddleware(req,res,next){
    try {
    const authHeaders=req.headers.authorization;
    if(!authHeaders){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    const token=authHeaders.split(" ")[1];
     if(!token){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token
    const validToken=jwt.verify(token,process.env.JWT_SECRET);
    if(!validToken){
     return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token Schema
    const {success,data}=tokenSchema.safeParse(validToken);
    if(!success){
         return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Check if userId exist in DB
    req.token=validToken
    next()

} catch (error) {
    console.log("Error in Middleware ",error);
    return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
}
}



export async function checkTeacher(req,res,next){
     try {
    const authHeaders=req.headers.authorization;
    if(!authHeaders){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    const token=authHeaders.split(" ")[1];
     if(!token){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token
    const validToken=jwt.verify(token,process.env.JWT_SECRET);
    if(!validToken){
     return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token Schema
    const {success,data}=tokenSchema.safeParse(validToken);
    if(!success){
         return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Check if userId has role teacher

    const user=await User.findById(data.userId);
    if(user.role!=="teacher"){
        return res.status(403).json({
            success:false,
            error:"Forbidden, not class teacher"
        })
    }
    req.user=user
    next()


} catch (error) {
    console.log("Error in Teacher Middleware ",error);
    return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
}
}




export async function checkStudent(req,res,next){
     try {
    const authHeaders=req.headers.authorization;
    if(!authHeaders){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    const token=authHeaders.split(" ")[1];
     if(!token){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token
    const validToken=jwt.verify(token,process.env.JWT_SECRET);
    if(!validToken){
     return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token Schema
    const {success,data}=tokenSchema.safeParse(validToken);
    if(!success){
         return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Check if userId has role teacher

    const user=await User.findById(data.userId);
    if(user.role!=="student"){
        return res.status(403).json({
            success:false,
            error:"Forbidden, not a student"
        })
    }
    req.user=user
    next()


} catch (error) {
    console.log("Error in Student Middleware ",error);
    return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
}
}



export async function checkTeacherOrStudent(req,res,next){

      try {
    const authHeaders=req.headers.authorization;
    if(!authHeaders){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    const token=authHeaders.split(" ")[1];
     if(!token){
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token
    const validToken=jwt.verify(token,process.env.JWT_SECRET);
    if(!validToken){
     return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Validate Token Schema
    const {success,data}=tokenSchema.safeParse(validToken);
    if(!success){
         return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
    // Check if userId has role teacher
    const userId=data.userId;
    const user=await User.findById(userId);
    if(!user){
        return res.status(404).json({
            success:false,
            error:"User not found"
        })
    }
    const existingClass=await Class.findById(req.params.id);
    if(!existingClass){
        return res.status(404).json({
            success:false,
            error:"Class not found"
        })
    }
    let isTeacher=false
    let isStudent=false
    if(userId===existingClass.teacherId.toString()){
        isTeacher=true;
    }
    for (const studentId of existingClass.studentIds){
        if(userId===studentId.toString()){
            isStudent=true
            break
        }
    }
    if(isTeacher || isStudent){
        req.class=existingClass
        next()
    }
    else{
        return res.status(403).json({
          success:false,
          error:"No Student or Teacher of Class"  
        })
    }

} catch (error) {
    console.log("Error in Student Teacher Middleware ",error);
    return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
}
}