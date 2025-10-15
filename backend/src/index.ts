import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
import { connectDB } from "./db/connection";
import userRoutes from "./routes/user";
import musicRoutes from "./routes/music";

dotenv.config();

const app = express();

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "audio-player-five-coral.vercel.app",
//     ],
//     credentials: true,
//   }),
// );
//
// ✅ Configure CORS properly
app.use(
  cors({
    origin: [
      "https://audio-player-five-coral.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
