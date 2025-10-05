import { useContext } from "react";
import { AuthContext } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import ModernAudioPlayer from "../component/audioPlayer";
import "../styles/home.css";

const Home = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎵 Music Player</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
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