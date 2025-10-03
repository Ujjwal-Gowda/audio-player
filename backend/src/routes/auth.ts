import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"

dotenv.config()

const  router=Router()

const users: { email:string; password: string }[] = [];
router.post("/signup",async (req:Request,res: Response) => {

    try {
        console.log("back")
        const{email,password}=  req.body;
        const hashedPassword= await bcrypt.hash(password,10);
        users.push({email, password : hashedPassword});
        res.json({message:"userRegistered"})
        const token=jwt.sign({email},process.env.JWT_SECRET!, {expiresIn:"7d"})
        res.json({ token });
    } catch (err) {
        return res.status(500).send({err:"signup unsuccessful"})
    }    

})

router.post("/login",async (req:Request,res:Response) => {

    try {
    const {email,password}=req.body;

    const user=users.find(u=>{
        return u.email===email
    })
    if (!user){
        return res.status(400).json({error:"user not found"})
    }
    const match=await bcrypt.compare(password,user.password);
    if(!match){
        return res.status(400).json({error:"invalid password"})
    }
    const token=jwt.sign({email},process.env.JWT_SECRET!, {expiresIn:"7d"})
    res.json({ token });

    } catch (error) {
        return res.status(400).json({error:"login failed"})
    }
})

export default router