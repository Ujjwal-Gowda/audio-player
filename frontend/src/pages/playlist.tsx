import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Play, Heart, Trash2, ArrowLeft } from "lucide-react";
import type { Track } from "./home";

const Playlist = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchUserTheme();
    fetchFavorites();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserTheme = async () => {
    try {
      const response = await axios.get(
        "https://audio-player-058s.onrender.com/protected",
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );
      const userTheme = response.data.user.themePref || "light";
      setTheme(userTheme);
    } catch (error) {
      console.error("Failed to fetch user theme:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      console.log("📋 Fetching favorites...");
      const response = await axios.get(
        `https://audio-player-058s.onrender.com/favorites`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        },
      );

      const favoriteIds: string[] = response.data.favorites || [];
      console.log(`📋 Found ${favoriteIds.length} favorite IDs:`, favoriteIds);

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch full track details in parallel with error handling
      const trackPromises = favoriteIds.map(async (id) => {
        try {
          console.log(`🎵 Fetching track: ${id}`);
          const response = await axios.get(
            `https://audio-player-058s.onrender.com/music/getid/${id}`,
            {
              headers: { Authorization: `Bearer ${auth?.token}` },
            },
          );
          console.log(`✓ Fetched track ${id}:`, response.data.title);
          return response.data;
        } catch (error: any) {
          console.error(
            `✗ Failed to fetch track ${id}:`,
            error.response?.status,
          );
          return null;
        }
      });

      const trackResults = await Promise.all(trackPromises);
      const validTracks = trackResults.filter(
        (track): track is Track => track !== null,
      );

      console.log(
        `✓ Successfully loaded ${validTracks.length} out of ${favoriteIds.length} favorites`,
      );
      setFavorites(validTracks);

      // Clean up invalid favorites from the database
      const invalidIds = favoriteIds.filter(
        (id) => !validTracks.find((t) => t.id === id),
      );

      if (invalidIds.length > 0) {
        console.log(`🧹 Cleaning up ${invalidIds.length} invalid favorites...`);
        for (const invalidId of invalidIds) {
          try {
            await axios.delete(
              `https://audio-player-058s.onrender.com/user/favorites/${invalidId}`,
              {
                headers: { Authorization: `Bearer ${auth?.token}` },
              },
            );
            console.log(`✓ Removed invalid favorite: ${invalidId}`);
          } catch (err) {
            console.error(
              `✗ Failed to remove invalid favorite ${invalidId}:`,
              err,
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (trackId: string) => {
    try {
      console.log(`🗑️ Removing favorite: ${trackId}`);
      await axios.delete(
        `https://audio-player-058s.onrender.com/user/favorites/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );

      setFavorites((prev) => prev.filter((track) => track.id !== trackId));
      console.log("✓ Removed from favorites");
    } catch (error: any) {
      console.error(
        "Failed to remove favorite:",
        error.response?.data || error,
      );
    }
  };

  const handlePlayTrack = (track: Track) => {
    console.log(`▶️ Playing track:`, track.title);
    navigate("/", { state: { track, playlist: favorites } });
  };

  const handleBack = () => {
    navigate("/");
  };

  const bgGradient =
    theme === "light"
      ? "linear-gradient(135deg, #f8b4d9 0%, #f4d4ba 100%)"
      : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";

  const cardBg =
    theme === "light" ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 20, 25, 0.3)";

  const cardHoverBg =
    theme === "light" ? "rgba(255, 255, 255, 0.25)" : "rgba(20, 25, 30, 0.4)";

  const textColor = theme === "light" ? "white" : "#e2e8f0";
  const textMuted =
    theme === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(226, 232, 240, 0.7)";
  const accentColor = theme === "light" ? "#ff6b9d" : "#9f7aea";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: bgGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        minHeight: "100vh",
        background: bgGradient,
        padding: isMobile ? "1rem" : "2rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: "background 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: cardBg,
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: isMobile ? "1.5rem" : "2rem",
            marginBottom: "2rem",
            border: `1px solid ${theme === "light" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background:
                theme === "light"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(159, 122, 234, 0.2)",
              border: `1px solid ${theme === "light" ? "rgba(255, 255, 255, 0.3)" : "rgba(159, 122, 234, 0.3)"}`,
              color: textColor,
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                theme === "light"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(159, 122, 234, 0.3)";
              e.currentTarget.style.transform = "translateX(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                theme === "light"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(159, 122, 234, 0.2)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <ArrowLeft size={18} />
            Back to Player
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: isMobile ? "60px" : "80px",
                height: isMobile ? "60px" : "80px",
                background: `linear-gradient(135deg, ${accentColor} 0%, ${theme === "light" ? "#c94b7c" : "#7c3aed"} 100%)`,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Heart size={isMobile ? 30 : 40} color="white" fill="white" />
            </div>
            <div>
              <h1
                style={{
                  color: textColor,
                  fontSize: isMobile ? "1.75rem" : "2.5rem",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                Your Favorites
              </h1>
              <p
                style={{
                  color: textMuted,
                  margin: 0,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                {favorites.length} {favorites.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>
        </div>

        {/* Playlist Content */}
        {favorites.length === 0 ? (
          <div
            style={{
              background: cardBg,
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "3rem",
              textAlign: "center",
              border: `1px solid ${theme === "light" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
            }}
          >
            <Heart
              size={60}
              color={textMuted}
              style={{ marginBottom: "1rem" }}
            />
            <h2
              style={{
                color: textColor,
                fontSize: "1.5rem",
                margin: "0 0 0.5rem 0",
              }}
            >
              No favorites yet
            </h2>
            <p
              style={{
                color: textMuted,
                margin: 0,
              }}
            >
              Start adding songs to your favorites by clicking the heart icon
            </p>
          </div>
        ) : (
          <div
            style={{
              background: cardBg,
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: isMobile ? "1rem" : "1.5rem",
              border: `1px solid ${theme === "light" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`,
            }}
          >
            {favorites.map((track, index) => (
              <div
                key={track.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "0.75rem" : "1rem",
                  padding: isMobile ? "0.75rem" : "1rem",
                  borderRadius: "12px",
                  marginBottom: "0.5rem",
                  background:
                    theme === "light"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.03)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => handlePlayTrack(track)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = cardHoverBg;
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    theme === "light"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {!isMobile && (
                  <span
                    style={{
                      color: textMuted,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      minWidth: "30px",
                    }}
                  >
                    {index + 1}
                  </span>
                )}

                <img
                  src={track.cover || "https://via.placeholder.com/60"}
                  alt={track.title}
                  style={{
                    width: isMobile ? "50px" : "60px",
                    height: isMobile ? "50px" : "60px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: textColor,
                      fontWeight: 600,
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      marginBottom: "0.25rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.title}
                  </div>
                  <div
                    style={{
                      color: textMuted,
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.artist}
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "0.5rem" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handlePlayTrack(track)}
                    style={{
                      background: `${accentColor}33`,
                      border: `1px solid ${accentColor}66`,
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${accentColor}66`;
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${accentColor}33`;
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Play size={16} color={accentColor} fill={accentColor} />
                  </button>

                  <button
                    onClick={() => handleRemoveFavorite(track.id)}
                    style={{
                      background: "rgba(255, 107, 157, 0.2)",
                      border: "1px solid rgba(255, 107, 157, 0.3)",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 107, 157, 0.4)";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 107, 157, 0.2)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Trash2 size={16} color="#ff6b9d" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
