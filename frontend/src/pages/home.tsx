import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import MusicPlayer from "../component/musicPlayer";
import SearchBar from "../component/searchBar";
import { Play } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  audioUrl: string;
  duration: number;
  genre?: string;
}

const Home = () => {
  const auth = useContext(AuthContext);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchUserTheme();
    fetchFavorites();

    // Check if coming from playlist with a track
    if (location.state?.track && location.state?.playlist) {
      setCurrentTrack(location.state.track);
      setPlaylist(location.state.playlist);
      const index = location.state.playlist.findIndex(
        (t: Track) => t.id === location.state.track.id,
      );
      setCurrentIndex(index >= 0 ? index : 0);
      setLoading(false);
    } else {
      // Load recommendations on mount
      loadRecommendations();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.state]);

  const fetchUserTheme = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER_THEME, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      const userTheme = response.data.user.themePref || "light";
      setTheme(userTheme);
      document.documentElement.setAttribute("data-theme", userTheme);
    } catch (error) {
      console.error("Failed to fetch user theme:", error);
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USER_FAVORITES, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      console.log("Fetched favorites:", response.data.favorites);
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      console.log("Loading new Releases");
      const response = await axios.get(API_ENDPOINTS.MUSIC_NEW_RELEASES, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      console.log("Received tracks:", response.data);

      if (response.data && response.data.length > 0) {
        setPlaylist(response.data);
        console.log(`✓ Loaded ${response.data.length} tracks`);
      } else {
        console.warn("No tracks returned from API");
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handlePlaylist = () => {
    navigate("/playlist");
  };

  const handleTrackSelect = (track: Track, trackList: Track[]) => {
    const index = trackList.findIndex((t) => t.id === track.id);
    setPlaylist(trackList);
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const handleTrackClick = (track: Track) => {
    const index = playlist.findIndex((t) => t.id === track.id);
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
  };

  const handleFavorite = async (trackId: string) => {
    try {
      const isFavorited = favorites.includes(trackId);
      console.log(`Track ${trackId} is currently favorited: ${isFavorited}`);

      if (isFavorited) {
        // Remove from favorites
        console.log("Removing from favorites...");
        const response = await axios.delete(
          API_ENDPOINTS.FAVORITES_DELETE(trackId),
          {
            headers: { Authorization: `Bearer ${auth?.token}` },
          },
        );
        console.log("Server response:", response.data);

        // Update local state AFTER successful server response
        setFavorites((prev) => {
          const updated = prev.filter((id) => id !== trackId);
          console.log("Updated favorites (removed):", updated);
          return updated;
        });
        console.log("✓ Removed from favorites");
      } else {
        // Add to favorites
        console.log("Adding to favorites...");
        const response = await axios.post(
          API_ENDPOINTS.FAVORITES_ADD,
          { trackId },
          { headers: { Authorization: `Bearer ${auth?.token}` } },
        );
        console.log("Server response:", response.data);

        // Update local state AFTER successful server response
        setFavorites((prev) => {
          const updated = [...prev, trackId];
          console.log("Updated favorites (added):", updated);
          return updated;
        });
        console.log("✓ Added to favorites");
      }
    } catch (error: any) {
      console.error(
        "Failed to update favorite:",
        error.response?.data || error,
      );
      // Revert the optimistic update if there was an error
      fetchFavorites(); // Re-fetch to get the correct state
    }
  };

  const bgGradient =
    theme === "light"
      ? "linear-gradient(135deg, #f8b4d9 0%, #f4d4ba 100%)"
      : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";

  const textColor = theme === "light" ? "#2d3748" : "#e2e8f0";
  const cardBg =
    theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 20, 25, 0.9)";
  const cardHoverBg =
    theme === "light" ? "rgba(255, 255, 255, 1)" : "rgba(20, 25, 30, 1)";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: bgGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: "white", fontSize: "1rem" }}>Loading music...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: bgGradient,
        transition: "background 0.3s ease",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: isMobile ? "0.75rem" : "0.625rem 1.25rem",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            minWidth: isMobile ? "44px" : "auto",
            minHeight: "44px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {!isMobile && <span>Muzic</span>}
        </button>
        <button
          onClick={handleProfile}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: isMobile ? "0.75rem" : "0.625rem 1.25rem",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            minWidth: isMobile ? "44px" : "auto",
            minHeight: "44px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {!isMobile && <span>Profile</span>}
        </button>
        <button
          onClick={handlePlaylist}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: isMobile ? "0.75rem" : "0.625rem 1.25rem",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            minWidth: isMobile ? "44px" : "auto",
            minHeight: "44px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16.8 5.73C15.3 4.6 14 3.64 14 1a1 1 0 0 0-2 0v13.52c-3.09-1.58-7.4 1.36-7.95 5a3.76 3.76 0 0 0 3.77 4.56c3.33 0 6.61-3.49 6.12-6.81C14 17 14 18 14 6c1.89 1.86 4 2.31 4 5v1a1 1 0 0 0 2 0c0-3-.25-4.07-3.2-6.27zm-6.13 15c-.63.94-3.07 2-4.18.84s-.25-3.08.84-4.17 3.14-1.87 4.18-.84.32 3.04-.84 4.19z" />
          </svg>
          {!isMobile && <span>Playlist</span>}
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: isMobile ? "0.75rem" : "0.625rem 1.25rem",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
            minWidth: isMobile ? "44px" : "auto",
            minHeight: "44px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!isMobile && <span>Logout</span>}
        </button>
      </header>

      {/* Search Bar */}
      <SearchBar
        onTrackSelect={handleTrackSelect}
        onFavorite={handleFavorite}
      />

      {/* Conditional Rendering: Masonry Grid or Music Player */}
      {!currentTrack ? (
        <div
          style={{
            paddingTop: "140px",
            paddingBottom: "2rem",
            paddingLeft: isMobile ? "1rem" : "2rem",
            paddingRight: isMobile ? "1rem" : "2rem",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: isMobile ? "1.5rem" : "2rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
              textAlign: "center",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            New Releases
          </h2>

          {/* Masonry Grid */}
          <div
            style={{
              columns: isMobile
                ? "1"
                : window.innerWidth < 768
                  ? "2"
                  : window.innerWidth < 1200
                    ? "3"
                    : "4",
              columnGap: "1rem",
              width: "100%",
            }}
          >
            {playlist.map((track) => (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                style={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  breakInside: "avoid",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0, 0, 0, 0.15)";
                  e.currentTarget.style.background = cardHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.background = cardBg;
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "100%",
                    marginBottom: "0.75rem",
                  }}
                >
                  <img
                    src={track.cover || "https://via.placeholder.com/300"}
                    alt={track.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.75rem",
                      right: "0.75rem",
                      background: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    className="play-button"
                  >
                    <Play size={20} color="#f8b4d9" fill="#f8b4d9" />
                  </div>
                </div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    margin: "0 0 0.25rem 0",
                    color: textColor,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {track.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: theme === "light" ? "#718096" : "#a0aec0",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {track.artist}
                </p>
              </div>
            ))}
          </div>

          <style>{`
            div:hover .play-button {
              opacity: 1 !important;
            }
          `}</style>
        </div>
      ) : (
        <MusicPlayer
          currentTrack={currentTrack}
          playlist={playlist}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onTrackSelect={(track) => handleTrackSelect(track, playlist)}
          onFavorite={handleFavorite}
          theme={theme}
          isFavorited={favorites.includes(currentTrack.id)}
        />
      )}
    </div>
  );
};

export default Home;
