import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.ts";
import { authMiddleware } from "./middleware/auth.ts";
import { connectDB } from "./db/connection.ts";
import userRoutes from "./routes/user.ts";
import musicRoutes from "./routes/music.ts";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://yourfrontend.netlify.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "This is a protected route 🚀",
    user: (req as any).user,
  });
});

app.get("/", (req, res) => {
  res.send("lesgoo");
  console.log("api running");
});

app.use("/user", authMiddleware, userRoutes);

app.use("/music", authMiddleware, musicRoutes);
const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server is running on port http://localhost:" + 5000);
  });
});
