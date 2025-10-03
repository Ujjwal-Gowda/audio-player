import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { configDotenv } from "dotenv";

configDotenv()

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "token not found" });
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (error, decoded) => {
        if (error) {
            return res.status(403).json({ error: "invalid token" });
        }
        (req as any).user = decoded;
        next();
    });
}