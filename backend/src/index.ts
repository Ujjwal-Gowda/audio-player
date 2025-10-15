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
// // ✅ Configure CORS properly
// app.use(
//   cors({
//     origin: [
//       "https://audio-player-five-coral.vercel.app",
//       "http://localhost:5173",
//     ],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   }),
// );

app.use(express.json());
// ✅ Robust CORS config
const allowedOrigins = [
  "https://audio-player-five-coral.vercel.app", // your frontend
  "http://localhost:5173", // local dev
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight OPTIONS requests manually (important for Render)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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
