// backend/src/services/musicApi.ts
import axios from 'axios';
import dotenv from "dotenv"
dotenv.config()
// Jamendo API for full-length free music
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'your_client_id';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

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

// Jamendo Service - Free full-length tracks
export class JamendoService {
  static async searchTracks(query: string, limit = 20): Promise<Track[]> {
    try {
      const response = await axios.get(`${JAMENDO_BASE_URL}/tracks`, {
        params: {
          client_id: JAMENDO_CLIENT_ID,
          format: 'json',
          limit,
          search: query,
          include: 'musicinfo',
          audioformat: 'mp32' // or 'ogg'
        }
      });

      return response.data.results.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        cover: track.album_image || track.image,
        audioUrl: track.audio,
        duration: track.duration,
        genre: track.musicinfo?.tags?.genres?.[0]
      }));
    } catch (error) {
      console.error('Jamendo API error:', error);
      return [];
    }
  }

  static async getPopularTracks(limit = 20): Promise<Track[]> {
    try {
      const response = await axios.get(`${JAMENDO_BASE_URL}/tracks`, {
        params: {
          client_id: JAMENDO_CLIENT_ID,
          format: 'json',
          limit,
          order: 'popularity_week',
          audioformat: 'mp32'
        }
      });

      return response.data.results.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        cover: track.album_image || track.image,
        audioUrl: track.audio,
        duration: track.duration
      }));
    } catch (error) {
      console.error('Jamendo API error:', error);
      return [];
    }
  }

  static async getTracksByGenre(genre: string, limit = 20): Promise<Track[]> {
    try {
      const response = await axios.get(`${JAMENDO_BASE_URL}/tracks`, {
        params: {
          client_id: JAMENDO_CLIENT_ID,
          format: 'json',
          limit,
          tags: genre,
          audioformat: 'mp32'
        }
      });

      return response.data.results.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        cover: track.album_image || track.image,
        audioUrl: track.audio,
        duration: track.duration,
        genre
      }));
    } catch (error) {
      console.error('Jamendo API error:', error);
      return [];
    }
  }
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
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString('base64')
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken!;
    } catch (error) {
      console.error('Spotify auth error:', error);
      throw error;
    }
  }

  static async searchTracks(query: string, limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        previewUrl: track.preview_url, // 30 seconds
        duration: track.duration_ms / 1000,
        spotifyUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Spotify API error:', error);
      return [];
    }
  }

  static async getRecommendations(seedTracks: string[], limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        'https://api.spotify.com/v1/recommendations',
        {
          params: {
            seed_tracks: seedTracks.join(','),
            limit
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0]?.url,
        previewUrl: track.preview_url
      }));
    } catch (error) {
      console.error('Spotify recommendations error:', error);
      return [];
    }
  }
}

// Combined service that prioritizes Jamendo for playback
export class MusicService {
  static async search(query: string, limit = 20): Promise<Track[]> {
    // Get full tracks from Jamendo
    const jamendoTracks = await JamendoService.searchTracks(query, limit);
    // Optionally enrich with Spotify metadata if needed
    return jamendoTracks;
  }

  static async getPopular(limit = 20): Promise<Track[]> {
    return JamendoService.getPopularTracks(limit);
    
  }
  

  static async getByGenre(genre: string, limit = 20): Promise<Track[]> {
    return JamendoService.getTracksByGenre(genre, limit);
  }
}

export default MusicService;