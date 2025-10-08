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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchFavorites();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchFavorites = async () => {
    try {
      const userResponse = await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      
      const favoriteIds = userResponse.data.user.favorites || [];
      
      // Fetch track details for each favorite
      // This is a simplified version - you might want to create a backend endpoint
      // that returns full track details for favorites
      const trackPromises = favoriteIds.map(async (id: string) => {
        try {
          // You'll need to implement a way to get track details by ID
          // For now, returning a placeholder
          return {
            id,
            title: "Favorite Track",
            artist: "Artist",
            album: "Album",
            cover: "https://via.placeholder.com/200",
            audioUrl: "",
            duration: 0
          };
        } catch (error) {
          return null;
        }
      });

      const tracks = await Promise.all(trackPromises);
      setFavorites(tracks.filter(Boolean) as Track[]);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (trackId: string) => {
    try {
      await axios.delete(`http://localhost:5000/user/favorites/${trackId}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      
      setFavorites(prev => prev.filter(track => track.id !== trackId));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const handlePlayTrack = (track: Track) => {
    // Navigate back to home with the selected track
    navigate("/", { state: { track, playlist: favorites } });
  };

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '1rem' : '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: isMobile ? '1.5rem' : '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={18} />
            Back to Player
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: isMobile ? '60px' : '80px',
              height: isMobile ? '60px' : '80px',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c94b7c 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}>
              <Heart size={isMobile ? 30 : 40} color="white" fill="white" />
            </div>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: isMobile ? '1.75rem' : '2.5rem',
                margin: '0 0 0.5rem 0',
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}>
                Your Favorites
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}>
                {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>
        </div>

        {/* Playlist Content */}
        {favorites.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Heart size={60} color="rgba(255, 255, 255, 0.5)" style={{ marginBottom: '1rem' }} />
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              margin: '0 0 0.5rem 0'
            }}>
              No favorites yet
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0
            }}>
              Start adding songs to your favorites by clicking the heart icon
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: isMobile ? '1rem' : '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {favorites.map((track, index) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.75rem' : '1rem',
                  padding: isMobile ? '0.75rem' : '1rem',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {!isMobile && (
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    minWidth: '30px'
                  }}>
                    {index + 1}
                  </span>
                )}
                
                <img
                  src={track.cover}
                  alt={track.title}
                  style={{
                    width: isMobile ? '50px' : '60px',
                    height: isMobile ? '50px' : '60px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {track.title}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {track.artist}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(track.id);
                    }}
                    style={{
                      background: 'rgba(255, 107, 157, 0.2)',
                      border: '1px solid rgba(255, 107, 157, 0.3)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 107, 157, 0.4)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 107, 157, 0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Trash2 size={16} color="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Playlist;