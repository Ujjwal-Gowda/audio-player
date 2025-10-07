import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MusicPlayer from "../component/musicPlayer";

const Home = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserTheme();
  }, []);

  const fetchUserTheme = async () => {
    try {
      const response = await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      const userTheme = response.data.user.themePref || "light";
      document.documentElement.setAttribute("data-theme", userTheme);
    } catch (error) {
      console.error("Failed to fetch user theme:", error);
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header with absolute positioning */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <button 
          onClick={handleProfile}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.625rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Profile</span>
        </button>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.625rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Logout</span>
        </button>
      </header>

      {/* Music Player */}
      <MusicPlayer />
      
      <style>{`
        @media (max-width: 480px) {
          header {
            padding: 0.75rem 1rem !important;
          }
          header button {
            min-width: 44px !important;
            padding: 0.75rem !important;
          }
          header button span {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;