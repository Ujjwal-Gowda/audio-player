import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { User } from "../models/user";

const router = Router();

// Update user theme preference
router.patch("/theme", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { themePref } = req.body;
    const userId = (req as any).user._id;

    if (!themePref || !["light", "dark"].includes(themePref)) {
      return res.status(400).json({ error: "Invalid theme preference" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { themePref },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Theme updated successfully",
      themePref: user.themePref,
    });
  } catch (error) {
    console.error("Theme update error:", error);
    res.status(500).json({ error: "Failed to update theme" });
  }
});

router.post(
  "/favorites",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const { trackId } = req.body;
      const userId = (req as any).user._id;

      if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.favorites.includes(trackId)) {
        return res.status(400).json({ error: "Track already in favorites" });
      }

      user.favorites.push(trackId);
      await user.save();

      res.json({ message: "Added to favorites", favorites: user.favorites });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  },
);
router.get(
  "/favorites",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      console.log("→ GET /user/favorites hit");
      const userId = (req as any).user._id;
      console.log(userId);
      if (!userId) {
        return res.status(400).json({ error: "user ID is not found" });
      }

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const favorite = user.favorites;
      console.log(favorite);
      if (!favorite) {
        return res.status(404).json({ error: "no faviroutes found" });
      }
      res.json({
        message: "Added to favorites",
        favorites: user.favorites,
      });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  },
);

// Remove track from favorites
router.delete(
  "/favorites/:trackId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { trackId } = req.params;
      const userId = (req as any).user._id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.favorites = user.favorites.filter((id) => id !== trackId);
      await user.save();

      res.json({
        message: "Removed from favorites",
        favorites: user.favorites,
      });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  },
);

export default router;
