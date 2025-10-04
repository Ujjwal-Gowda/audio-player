import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { configDotenv } from "dotenv";
import { User } from "../models/user";

configDotenv()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "token not found" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await User.findById(payload.userId).select("-password");
        if (!user) {
        return res.status(403).json({ message: "User not found" });
        }
        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}