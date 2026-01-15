import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { tokenSchema } from "../zod/validator.js";
import { User } from "../models/user.model.js";
import { Class } from "../models/class.model.js";
dotenv.config()

function extractToken(authHeader) {
    if (!authHeader) return null
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7)
    }
    return authHeader
}

export async function authMiddleware(req,res,next){
    try {
        const authHeader = req.headers.authorization
        const token = extractToken(authHeader)
        
        if(!token){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!validToken){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const {success, data} = tokenSchema.safeParse(validToken)
        if(!success){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        req.token = validToken
        next()
    } catch (error) {
        console.log("Error in Middleware ", error)
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
}

export async function checkTeacher(req,res,next){
    try {
        const authHeader = req.headers.authorization
        const token = extractToken(authHeader)
        
        if(!token){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!validToken){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const {success, data} = tokenSchema.safeParse(validToken)
        if(!success){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const user = await User.findById(data.userId)
        if(!user || user.role !== "teacher"){
            return res.status(403).json({
                success:false,
                error:"Forbidden, teacher access required"
            })
        }

        req.user = user
        req.token = validToken
        next()
    } catch (error) {
        console.log("Error in Teacher Middleware ", error)
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
}

export async function checkStudent(req,res,next){
    try {
        const authHeader = req.headers.authorization
        const token = extractToken(authHeader)
        
        if(!token){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!validToken){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const {success, data} = tokenSchema.safeParse(validToken)
        if(!success){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const user = await User.findById(data.userId)
        if(!user || user.role !== "student"){
            return res.status(403).json({
                success:false,
                error:"Forbidden, student access required"
            })
        }

        req.user = user
        req.token = validToken
        next()
    } catch (error) {
        console.log("Error in Student Middleware ", error)
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
}

export async function checkTeacherOrStudent(req,res,next){
    try {
        const authHeader = req.headers.authorization
        const token = extractToken(authHeader)
        
        if(!token){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!validToken){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const {success, data} = tokenSchema.safeParse(validToken)
        if(!success){
            return res.status(401).json({
                success:false,
                error:"Unauthorized, token missing or invalid"
            })
        }

        const userId = data.userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({
                success:false,
                error:"User not found"
            })
        }

        const existingClass = await Class.findById(req.params.id)
        if(!existingClass){
            return res.status(404).json({
                success:false,
                error:"Class not found"
            })
        }

        let isTeacher = false
        let isStudent = false
        if(userId === existingClass.teacherId.toString()){
            isTeacher = true
        }
        for (const studentId of existingClass.studentIds){
            if(userId === studentId.toString()){
                isStudent = true
                break
            }
        }

        if(isTeacher || isStudent){
            req.class = existingClass
            req.user = user
            req.token = validToken
            next()
        }
        else{
            return res.status(403).json({
                success:false,
                error:"Forbidden, not class teacher"  
            })
        }
    } catch (error) {
        console.log("Error in Student Teacher Middleware ", error)
        return res.status(401).json({
            success:false,
            error:"Unauthorized, token missing or invalid"
        })
    }
}