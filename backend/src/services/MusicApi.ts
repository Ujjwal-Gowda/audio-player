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
        console.log("[SpotifyService] 🎧 New access token generated");
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
        audioUrl: track.preview_url || "",
        duration: track.duration_ms / 1000,
        spotifyUrl: track.external_urls.spotify,
      }));
    } catch (error) {
      console.error("Spotify API error:", error);
      return [];
    }
  }

  // FIXED: Now returns actual tracks with audio URLs, not albums
  static async newReleases(limit = 8): Promise<Track[]> {
    try {
      const token = await this.getAccessToken();

      // Step 1: Get new release albums
      const albumsResponse = await axios.get(
        "https://api.spotify.com/v1/browse/new-releases",
        {
          params: {
            limit: 8, // Get 10 albums
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const albums = albumsResponse.data.albums.items;
      const tracks: Track[] = [];

      // Step 2: For each album, get its tracks
      for (const album of albums) {
        try {
          const tracksResponse = await axios.get(
            `https://api.spotify.com/v1/albums/${album.id}/tracks`,
            {
              params: { limit: 2 }, // Get 2 tracks per album
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          // Step 3: Get full track details (including preview URLs)
          for (const track of tracksResponse.data.items) {
            try {
              const trackDetails = await this.getTrackById(track.id);
              if (trackDetails) {
                tracks.push(trackDetails);
              }
            } catch (err) {
              console.warn(`Failed to fetch track ${track.id}`);
            }
          }

          // Stop if we have enough tracks
          if (tracks.length >= limit) {
            break;
          }
        } catch (err) {
          console.warn(`Failed to fetch tracks for album ${album.id}`);
        }
      }

      console.log(`✓ Fetched ${tracks.length} new release tracks`);
      return tracks.slice(0, limit);
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
      let audioUrl = track.preview_url || "";

      // Try to get preview URL if not available
      if (!audioUrl) {
        try {
          const previewUrl = await SpotifyPreviewFinder.getPreviewUrl(track.id);
          audioUrl = previewUrl || "";
        } catch (err) {
          console.warn(`No preview available for track ${trackId}`);
        }
      }

      return {
        id: track.id,
        title: track.name,
        artist: track.artists[0]?.name || "Unknown Artist",
        album: track.album?.name || "Unknown Album",
        cover: track.album?.images[0]?.url || "",
        audioUrl: audioUrl,
        duration: track.duration_ms / 1000 || 0,
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
      console.log("Fetching new release tracks...");
      let tracks = await SpotifyService.newReleases(20);
      console.log("New release tracks fetched successfully.", tracks.length);
      return tracks;
    } catch (error) {
      console.error("Error in newReleases:", error);
      return [];
    }
  }

  static async getTrackById(trackId: string): Promise<Track | null> {
    return SpotifyService.getTrackById(trackId);
  }
}

export default MusicService;
