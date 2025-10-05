import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authcontext";
import "../styles/profile.css";

interface UserData {
  name: string;
  email: string;
  themePref: "light" | "dark";
  createdAt: string;
}

const Profile = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/protected", {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      const user = response.data.user;
      setUserData(user);
      setTheme(user.themePref || "light");
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    try {
      await axios.patch(
        "http://localhost:5000/user/theme",
        { themePref: newTheme },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">{getInitial(userData.name)}</div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Name</span>
            <span className="info-value">{userData.name}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{userData.email}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">{formatDate(userData.createdAt)}</span>
          </div>
        </div>

        <div className="theme-section">
          <span className="section-label">Appearance</span>
          <div className="theme-toggle">
            <button
              className={`theme-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => handleThemeToggle("light")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Light
            </button>
            <button
              className={`theme-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => handleThemeToggle("dark")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark
            </button>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;