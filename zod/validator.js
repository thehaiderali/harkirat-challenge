import {z} from "zod"

export const signUpSchema=z.object({
    name:z.string(),
    email:z.email(),
    password:z.string().min(6),
    role:z.enum(["teacher","student"])
})


export const loginSchema=z.object({
    email:z.string(),
    password:z.string().min(6),
})


export const tokenSchema=z.object({
    userId:z.string(),
    role:z.enum(["teacher","student"])
})


export const classSchema=z.object({
    className:z.string().min(3).max(10)
})

export const addStudentSchema=z.object({
    studentId:z.string()
})