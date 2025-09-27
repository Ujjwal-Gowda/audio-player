import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"

dotenv.config()

const router=Router()

const users: { email:string; password: string }[] = [];
router.post("/signup",async (res: Response,req:Request) => {

    try {
        const{email,password}=  req.body;
        const hashedPassword= await bcrypt.hash(password,10);
        users.push({email, password : hashedPassword});
        res.json({message:"userRegistered"})
    } catch (err) {
        return res.status(500).send({err:"signup unsuccessful"})
    }    

})

router.get("/login",async (res:Response,req:Request) => {

    try {
    const {email,password}=req.body;

    const user=users.find(u=>{
        u.email===email
    })
    if (!user){
        return res.status(400).json({error:"user not found"})
    }
    const match=bcrypt.compare(password,user.password);
    if(!password){
        return res.status(400).json({error:"invalid password"})
    }
    const token=jwt.sign({email},process.env.JWT_SECRET!, {expiresIn:"7d"})
    res.json({ token });

    } catch (error) {
        return res.status(400).json({error:"login failed"})
    }
})

export default router