import mongoose from "mongoose";

const attendanceSchema=new mongoose.Schema({
    classId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Class"
    },
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["present","absent"]
    }
})

export const Attendance=mongoose.model("Attendance",attendanceSchema)