import {Router} from "express";
import { addStudentSchema, classSchema, startAttendanceSchema } from "../zod/validator.js";
import { User } from "../models/user.model.js";
import { Class } from "../models/class.model.js";
import { checkStudent, checkTeacher, checkTeacherOrStudent } from "../middleware/auth.js";
import { Attendance } from "../models/attendance.model.js";
import { Types } from "mongoose";

const classRouter=Router();

classRouter.post("/class",checkTeacher,async(req,res)=>{
    try {
      const {success,data}=classSchema.safeParse(req.body);
        if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    const teacher=await User.findById(req.user._id.toString());
    const newClass=await Class.create({
        className:data.className,
        teacherId:teacher._id,
        studentIds:[]
    })
    return res.status(201).json({
        success:true,
        data:newClass
    })

    } catch (error) {
        console.log("Error in Creating Class Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})


classRouter.post("/class/:id/add-student",checkTeacher,async(req,res)=>{
    try {
        
     const existingClass=await Class.findById(req.params.id);
     if(!existingClass){
        return res.status(404).json({
            success:false,
            error:"Class not found"
        })
     }
     const {success,data}=addStudentSchema.safeParse(req.body);
      if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    const student=await User.findById(data.studentId);
    if(!student){
        return res.status(404).json({
            success:false,
            error:"Student not found"
        })
    }
    if(existingClass.teacherId.toString()!==req.user._id.toString()){
        return res.status(403).json({
            success:false,
            error:"Forbidden, not class teacher"
        })
    }
    const alreadyEnrolled = existingClass.studentIds.some(
    id => id.toString() === data.studentId
    );

    if(alreadyEnrolled){
        return res.status(400).json({
            success:false,
            error:"Student already enrolled in this class"
        })
    }

    const oldstudents=existingClass.studentIds
    const newStudents=[...oldstudents,new Types.ObjectId(data.studentId)]
    const newClass=await Class.findByIdAndUpdate(existingClass._id,{
        studentIds:newStudents,
    },{
        new:true
    })

    return res.status(200).json({
        success:true,
        data:newClass
    })
        
    } catch (error) {
        console.log("Error in Adding Student Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})

classRouter.get("/class/:id",checkTeacherOrStudent,async(req,res)=>{
    try {

        const response=await Class.findById(req.params.id).populate({
        path:"studentIds",
        select:"name email"
    })
    const classData = response.toObject();
    classData.students = classData.studentIds;
    delete classData.studentIds;
    
    return res.status(200).json({
        success:true,
        data:classData
    })
        
    } catch (error) {
        console.log("Error in Adding Student Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})


classRouter.get("/students",checkTeacher,async(req,res)=>{
    try {

     const response=await User.find({
        role:"student"
    })
    return res.status(200).json({
        success:true,
        data:response
    })
        
    } catch (error) {
        console.log("Error in Adding Student Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})


classRouter.get("/class/:id/my-attendance",checkStudent,async(req,res)=>{
    try {
     const existingClass=await Class.findById(req.params.id);
    if(!existingClass){
        return res.status(404).json({
            success:false,
            error:"Class not found"
        })
    }
    const isEnrolled = existingClass.studentIds.some(id => id.toString() === req.user._id.toString());
    if(!isEnrolled){
        return res.status(403).json({
            success:false,
            error:"Forbidden, not enrolled in class"
        })
    }
    const attendance=await Attendance.findOne({
        classId:existingClass._id,
        studentId:req.user._id,
    })
    if(!attendance || !attendance.status){
        return res.status(200).json({
            success:true,
            data:{
                classId:existingClass._id.toString(),
                status:null
            }       
        })
    }
    else { 
        return res.status(200).json({
            success:true,
            data:{
                classId:existingClass._id.toString(),
                status:attendance.status,
            }       
        })
    }

    } catch (error) {
        console.log("Error in Checking My Attendance Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
})

classRouter.post("/attendance/start",checkTeacher,async(req,res)=>{
     try {
        
     const {success,data}=startAttendanceSchema.safeParse(req.body);   
     if(!success){
        return res.status(400).json({
            success:false,
            error:"Invalid request schema"
        })
    }
    const existingClass=await Class.findById(data.classId);
    if(!existingClass){
        return res.status(404).json({
            success:false,
            error:"Class not found"
        })
    }
    if(req.user._id.toString()!==existingClass.teacherId.toString()){
        return res.status(403).json({
            success:false,
            error:"Forbidden, not class teacher"
        })
    }
    if(global.activeSession!==null){
        return res.status(400).json({
            success:false,
            error:"Already One Session Exists"
        })
    }
    global.activeSession={
        classId:data.classId,
        startedAt:new Date().toISOString(),
        attendance:{}
    }
    return res.status(200).json({
        success:true,
        data:{
        classId:data.classId,
        startedAt:new Date().toISOString()  
        }
    })

     } catch (error) {
        console.log("Error in Checking My Attendance Route : ",error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
     }
})


export default classRouter;