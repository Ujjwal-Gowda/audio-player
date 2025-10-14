// backend/src/routes/music.ts
import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import MusicService from "../services/MusicApi";
import axios from "axios";

const router = Router();

// Search tracks
router.get("/search", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const tracks = await MusicService.search(q, Number(limit));
    res.json({ tracks, count: tracks.length });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search tracks" });
  }
});

// // Get popular tracks
// router.get("/popular", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const { limit = 20 } = req.query;
//     const tracks = await MusicService.getPopular(Number(limit));
//     res.json({ tracks, count: tracks.length });
//   } catch (error) {
//     console.error("Popular tracks error:", error);
//     res.status(500).json({ error: "Failed to fetch popular tracks" });
//   }
// });

router.get(
  "/newreleases",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const tracks = await MusicService.newReleases();
      console.log(`Fetched ${tracks.length} tracks`);
      res.json(tracks);
    } catch (error: any) {
      console.error(
        "error fetching recommendation",
        error.response?.data || error,
      );
      res.status(500).json({ error: "Failed to fetch recommended tracks" });
    }
  },
);
// router.get("/getid", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const trackId = req.body;
//     const tracks = await MusicService.getTrackById(trackId);
//     res.json(tracks ?? []);
//   } catch (error: any) {
//     console.error("error fetching tracks", error.response?.data || error);
//     res.status(500).json({ error: "Failed to fetch favorite tracks" });
//   }
// });

// Get tracks by genre
// router.get(
//   "/genre/:genre",
//   authMiddleware,
//   async (req: Request, res: Response) => {
//     try {
//       const { genre } = req.params;
//       const { limit = 20 } = req.query;

//       const tracks = await MusicService.getByGenre(genre, Number(limit));
//       res.json({ tracks, count: tracks.length });
//     } catch (error) {
//       console.error("Genre tracks error:", error);
//       res.status(500).json({ error: "Failed to fetch tracks by genre" });
//     }
//   },
// );
//

router.get(
  "/getid/:trackId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { trackId } = req.params;
      const accessToken = process.env.SPOTIFY_ACCESS_TOKEN; // or however you're managing tokens

      const spotifyResponse = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const track = spotifyResponse.data;

      // 🎯 Normalize the response
      const formattedTrack = {
        id: track.id,
        title: track.name,
        artist: track.artists?.map((a: any) => a.name).join(", "),
        cover: track.album?.images?.[0]?.url,
        preview_url: track.preview_url,
        duration_ms: track.duration_ms,
      };

      console.log("🎧 Spotify Track Response:", spotifyResponse.data);

      res.json(formattedTrack);
    } catch (error: any) {
      console.error(
        "Error fetching track:",
        error.response?.data || error.message,
      );
      res.status(500).json({ error: "Failed to fetch track details" });
    }
  },
);
export default router;
