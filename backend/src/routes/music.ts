// backend/src/routes/music.ts
import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import MusicService from "../services/MusicApi";

const router = Router();

// Search tracks
router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Search query is required" });
    }

    const tracks = await MusicService.search(q, Number(limit));
    res.json({ tracks, count: tracks.length });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search tracks" });
  }
});

// Get popular tracks
router.get("/popular", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const tracks = await MusicService.getPopular(Number(limit));
    res.json({ tracks, count: tracks.length });
  } catch (error) {
    console.error("Popular tracks error:", error);
    res.status(500).json({ error: "Failed to fetch popular tracks" });
  }
});

// Get tracks by genre
router.get("/genre/:genre", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;
    
    const tracks = await MusicService.getByGenre(genre, Number(limit));
    res.json({ tracks, count: tracks.length });
  } catch (error) {
    console.error("Genre tracks error:", error);
    res.status(500).json({ error: "Failed to fetch tracks by genre" });
  }
});

export default router;