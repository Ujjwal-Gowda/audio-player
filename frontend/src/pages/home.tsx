import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MusicPlayer from "../component/musicPlayer";

const Home = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    fetchUserTheme();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handlePlaylist=()=>{
    navigate("/playlist");
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header with fixed positioning */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
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
            padding: isMobile ? '0.75rem' : '0.625rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {!isMobile && <span>Profile</span>}
        </button>
        <button 
          onClick={handlePlaylist}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: isMobile ? '0.75rem' : '0.625rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M16.8 5.73C15.3 4.6 14 3.64 14 1a1 1 0 0 0-2 0v13.52c-3.09-1.58-7.4 1.36-7.95 5a3.76 3.76 0 0 0 3.77 4.56c3.33 0 6.61-3.49 6.12-6.81C14 17 14 18 14 6c1.89 1.86 4 2.31 4 5v1a1 1 0 0 0 2 0c0-3-.25-4.07-3.2-6.27zm-6.13 15c-.63.94-3.07 2-4.18.84s-.25-3.08.84-4.17 3.14-1.87 4.18-.84.32 3.04-.84 4.19z" data-name="note music"/>
            </svg>
          {!isMobile && <span>PlayList</span>}
        </button>      
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: isMobile ? '0.75rem' : '0.625rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: '44px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!isMobile && <span>Logout</span>}
        </button>
      </header>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};

export default Home;