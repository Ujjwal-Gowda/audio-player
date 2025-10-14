export const API_URL =
  import.meta.env.VITE_API_URL || "https://audio-player-058s.onrender.com";

export const authHeaders = (token: string | null) => ({
  Authorization: `Bearer ${token}`,
});

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/auth/login`,
  SIGNUP: `${API_URL}/auth/signup`,

  // User
  PROTECTED: `${API_URL}/protected`,
  USER_THEME: `${API_URL}/user/theme`,
  USER_FAVORITES: `${API_URL}/user/favorites`,

  // Music
  MUSIC_SEARCH: `${API_URL}/music/search`,
  MUSIC_NEW_RELEASES: `${API_URL}/music/newreleases`,
  MUSIC_GET_TRACK: (trackId: string) => `${API_URL}/music/getid/${trackId}`,

  // Favorites
  FAVORITES_ADD: `${API_URL}/user/favorites`,
  FAVORITES_GET: `${API_URL}/user/favorites`,
  FAVORITES_DELETE: (trackId: string) => `${API_URL}/user/favorites/${trackId}`,
};
