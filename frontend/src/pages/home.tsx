import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModernAudioPlayer from "../component/audioPlayer";
import "../styles/home.css";

const Home = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
      setTheme(userTheme);
      document.documentElement.setAttribute("data-theme", userTheme);
    } catch (error) {
      console.error("Failed to fetch user theme:", error);
      // Default to light theme if fetch fails
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
    <div className="home-container">
      <header className="home-header">
        <h1>🎵 Music Player</h1>
        <div className="header-actions">
          <button className="profile-btn" onClick={handleProfile}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="home-main">
        <ModernAudioPlayer />
      </main>

      <footer className="home-footer">
        <p>Enjoy your music! 🎧</p>
      </footer>
    </div>
  );
};

export default Home;

