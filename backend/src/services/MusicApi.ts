// backend/src/services/musicApi.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import SpotifyPreviewFinder from "spotify-preview-finder";
// Spotify API for metadata and discovery
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

// Spotify Service - For rich metadata and recommendations
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

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.accessToken!;
    } catch (error) {
      console.error("Spotify auth error:", error);
      throw error;
    }
  }

  static async searchTracks(query: string, limit = 20) {
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

  // static async getRecommendations(limit = 20) {
  //   try {
  //     const token = await this.getAccessToken();

  //     // Use valid Spotify genre seeds
  //     const genreSeeds = ["pop", "rock", "indie", "electronic", "hip-hop"];
  //     const selectedSeeds = genreSeeds.slice(0, 5).join(",");

  //     console.log(
  //       "Fetching Spotify recommendations with seeds:",
  //       selectedSeeds,
  //     );

  //     const response = await axios.get(
  //       "https://api.spotify.com/v1/recommendations",
  //       {
  //         params: {
  //           limit,
  //           seed_genres: selectedSeeds,
  //         },
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );

  //     console.log(`Spotify returned ${response.data.tracks.length} tracks`);

  //     // Filter tracks that have preview URLs
  //     const tracksWithPreview = response.data.tracks
  //       .filter((track: any) => track.preview_url)
  //       .map((track: any) => ({
  //         id: track.id,
  //         title: track.name,
  //         artist: track.artists[0].name,
  //         album: track.album.name,
  //         cover: track.album.images[0]?.url || track.album.images[1]?.url,
  //         audioUrl: track.preview_url,
  //         duration: track.duration_ms / 1000,
  //         genre: "various",
  //       }));

  //     console.log(`${tracksWithPreview.length} tracks have preview URLs`);
  //     return tracksWithPreview;
  //   } catch (error: any) {
  //     console.error(
  //       "Spotify recommendations error:",
  //       error.response?.data || error.message,
  //     );
  //     return [];
  //   }
  // }

  static async getRecommendations(limit = 20) {
    try {
      const token = await this.getAccessToken();

      const genreSeeds = ["pop", "rock", "indie", "electronic", "hip-hop"];
      const selectedSeeds = genreSeeds.slice(0, 5).join(",");

      console.log(
        "Fetching Spotify recommendations with seeds:",
        selectedSeeds,
      );

      const response = await axios.get(
        "https://api.spotify.com/v1/recommendations",
        {
          params: { limit, seed_genres: selectedSeeds },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log(`Spotify returned ${response.data.tracks.length} tracks`);

      // ✅ Use preview-finder for missing previews
      const tracks: Track[] = [];
      for (const track of response.data.tracks) {
        let previewUrl = track.preview_url;

        if (!previewUrl) {
          try {
            previewUrl = await SpotifyPreviewFinder.getPreviewUrl(track.id);
            if (previewUrl)
              console.log(`🎵 Found external preview for ${track.name}`);
          } catch (err) {
            console.warn(`No preview for ${track.name}`);
          }
        }

        if (previewUrl) {
          tracks.push({
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            cover: track.album.images[0]?.url || track.album.images[1]?.url,
            audioUrl: previewUrl,
            duration: track.duration_ms / 1000,
            genre: "various",
          });
        }
      }

      console.log(`${tracks.length} tracks have valid previews`);
      return tracks;
    } catch (error: any) {
      console.error(
        "Spotify recommendations error:",
        error.response?.data || error.message,
      );
      return [];
    }
  }

  // Alternative: Get popular playlists for recommendations
  static async getFeaturedPlaylists(limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        "https://api.spotify.com/v1/browse/featured-playlists",
        {
          params: { limit: 5 },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Get tracks from first playlist
      const playlistId = response.data.playlists.items[0].id;
      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          params: { limit },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return tracksResponse.data.items
        .filter((item: any) => item.track?.preview_url)
        .map((item: any) => ({
          id: item.track.id,
          title: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          cover: item.track.album.images[0]?.url,
          audioUrl: item.track.preview_url,
          duration: item.track.duration_ms / 1000,
        }));
    } catch (error) {
      console.error("Spotify featured playlists error:", error);
      return [];
    }
  }
}

// Combined service
export class MusicService {
  static async search(query: string, limit = 20): Promise<Track[]> {
    return SpotifyService.searchTracks(query, limit);
  }

  static async getRecommendation(): Promise<Track[]> {
    try {
      console.log("Fetching recommendations...");

      // Try Spotify (30-second previews only)
      const spotifyTracks = await SpotifyService.getRecommendations(10);

      // Combine both sources
      const allTracks = [...spotifyTracks];

      // If neither works, try featured playlists as fallback
      if (allTracks.length === 0) {
        console.log("Trying featured playlists as fallback...");
        const playlistTracks = await SpotifyService.getFeaturedPlaylists(20);
        return playlistTracks;
      }

      return allTracks;
    } catch (error) {
      console.error("Error in getRecommendation:", error);
      return [];
    }
  }

  static async getPopular(limit = 20): Promise<Track[]> {
    return SpotifyService.getFeaturedPlaylists(limit);
  }
}

export default MusicService;
