import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import { User } from "../models/user";

dotenv.config()

const  router=Router()

router.post("/signup",async (req:Request,res: Response) => {

    try {
        const{name,email,password}=  req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const exists=await User.findOne({email})
        if(exists){
            return res.status(400).json({error:"user already exists"})
        }
        const hashedPassword= await bcrypt.hash(password,10);
        const user=new User({name,email,password:hashedPassword})
        user.save()
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET!, {expiresIn:"7d"})
        res.status(201).json({ token });
    } catch (err) {
        return res.status(500).send({err:"signup unsuccessful"})
    }    

})

router.post("/login",async (req:Request,res:Response) => {

    try {
    const {email,password}=req.body;

    const user=await User.findOne({email})
    if (!user){
        return res.status(400).json({error:"user not found"})
    }
    const match=await bcrypt.compare(password,user.password);
    if(!match){
        return res.status(400).json({error:"invalid password"})
    }
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET!, {expiresIn:"7d"})
    res.json({ token });

    } catch (error) {
        return res.status(400).json({error:"login failed"})
    }
})

export default router