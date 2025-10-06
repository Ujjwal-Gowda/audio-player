import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.ts" 
import { authMiddleware } from "./middleware/auth.ts";
import { connectDB } from "./db/connection.ts";
import userRoutes from "./routes/user.ts"

dotenv.config();

const app=express();


app.use(cors());

app.use(express.json());

app.use("/auth",authRoutes)


app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route 🚀", user: (req as any).user });
});

app.get("/",()=>{
    console.log("api running");
});

app.use("/user", authMiddleware, userRoutes)
const PORT=process.env.PORT

connectDB().then(() => {
    app.listen(PORT,()=>{
    console.log("server is running on port http://localhost:"+ PORT);
    })
})

