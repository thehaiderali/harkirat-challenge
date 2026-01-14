import dotenv from "dotenv"
dotenv.config()
import {Router} from "express"
import { loginSchema, signUpSchema } from "../zod/validator.js"
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/auth.js";

const authRouter=Router()


authRouter.post("/signup",async(req,res)=>{

    try {

        const {success,data}=signUpSchema.safeParse(req.body);
    // Invalid Schema
    if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }

    // Duplicate Email Check 

    const already=await User.findOne({
        email:data.email
    })

    if(already){
        return res.status(400).json({
            success:false,
            error:"Email already exists"
        })
    }
    // Hash Password 

    const hashedPassword=await bcrypt.hash(data.password,10);

    const newUser=await User.create({
        name:data.name,
        email:data.email,
        password:hashedPassword,
        role:data.role,
    })
    const userResponse=newUser.toObject();
    delete userResponse.password;
    return res.status(201).json({
        success:true,
        data:userResponse
    })
        
    } catch (error) {
        console.log("Error in Sign Up Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }

})

authRouter.post("/login",async(req,res)=>{

  try {
    
    const {success,data}=loginSchema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    // Check if User Exist
    const already=await User.findOne({
        email:data.email
    })

    if(!already){
        return res.status(400).json({
            success:false,
            error:"Invalid email or password"
        })
    }
    // Validate Password

    const isMatch=await bcrypt.compare(data.password,already.password);
    if(!isMatch){
        return res.status(400).json({
            success:false,
            error:"Invalid email or password"
        })
    }

    // All Validation Done now Generate jwt token

    const token=jwt.sign({
        userId:already._id.toString(),
        role:already.role
    },process.env.JWT_SECRET,{
        expiresIn:"1h"
    })

    return res.status(200).json({
        success:true,
        data:{
            token
        }
    })

  } catch (error) {
    console.log("Error in Login  Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
  }

})


authRouter.get("/me",authMiddleware,async(req,res)=>{
   try {

    const {userId} =req.token
    const user=await User.findById(userId);
    if(!user){
        return res.status(404).json({
            success:false,
            error:"User not found"
        })

    }
    const userResponse=user.toObject();
    delete userResponse.password;
    return res.status(201).json({
        success:true,
        data:userResponse
    })

    
   } catch (error) {

    console.log("Error in Auth/me  Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    
   }

})


export default authRouter