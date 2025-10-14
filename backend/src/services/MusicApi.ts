// backend/src/services/MusicApi.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import SpotifyPreviewFinder from "spotify-preview-finder";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  audioUrl: string;
  duration: number;
  genre?: string;
}

export class SpotifyService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  private static async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
              ).toString("base64"),
          },
        },
      );

      const accessToken = response.data?.access_token;
      const expiresIn = response.data?.expires_in ?? 3600;

      if (!accessToken) {
        throw new Error("Spotify token response missing access_token");
      }

      this.accessToken = accessToken;
      this.tokenExpiry = Date.now() + expiresIn * 1000;
      const development = true;
      if (development === true) {
        console.log("[SpotifyService] 🎧 New access token generated:", "");
        console.log(
          "[SpotifyService] Token expires in:",
          expiresIn / 60,
          "minutes",
        );
      }
      return this.accessToken!;
    } catch (error) {
      console.error("Spotify auth error:", error);
      throw error;
    }
  }

  static async searchTracks(query: string, limit = 20): Promise<Track[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get("https://api.spotify.com/v1/search", {
        params: {
          q: query,
          type: "track",
          limit,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        duration: track.duration_ms / 1000,
        spotifyUrl: track.external_urls.spotify,
      }));
    } catch (error) {
      console.error("Spotify API error:", error);
      return [];
    }
  }

  static async newReleases(limit = 2): Promise<Track[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        "https://api.spotify.com/v1/browse/new-releases",
        {
          params: {
            limit: 2,
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data.albums.items.slice(0, limit).map((album: any) => ({
        id: album.id,
        title: album.name,
        artist: album.artists.map((a: any) => a.name).join(", "),
        album: album.name,
        cover: album.images[0]?.url || "",
        audioUrl: "",
        duration: 0,
        genre: "",
      }));
    } catch (error) {
      console.error("Error fetching new releases:", error);
      return [];
    }
  }

  static async getTrackById(trackId: string): Promise<Track | null> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const track = response.data;
      let previewUrl = track.preview_url;

      if (!previewUrl) {
        try {
          previewUrl = await SpotifyPreviewFinder.getPreviewUrl(track.id);
        } catch (err) {
          return null;
        }
      }

      if (!previewUrl) {
        return null;
      }

      return {
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url || "",
        audioUrl: previewUrl,
        duration: track.duration_ms / 1000,
      };
    } catch (error) {
      console.error("Error fetching track by ID:", error);
      return null;
    }
  }
}

export class MusicService {
  static async search(query: string, limit = 20): Promise<Track[]> {
    return SpotifyService.searchTracks(query, limit);
  }

  static async newReleases(): Promise<Track[]> {
    try {
      console.log("Fetching recommendations...");

      let tracks = await SpotifyService.newReleases();
      console.log("Recommendations fetched successfully.", tracks);
      return tracks;
    } catch (error) {
      console.error("Error in getRecommendation:", error);

      return [];
    }
  }

  static async getTrackById(trackId: string): Promise<Track | null> {
    return SpotifyService.getTrackById(trackId);
  }
}

export default MusicService;
