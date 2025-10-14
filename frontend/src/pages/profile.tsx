import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authcontext";
import "../styles/profile.css";
import { API_ENDPOINTS } from "../config/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PROTECTED, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      const user = response.data.user;
      setUserData(user);

      // Apply theme from user preferences
      document.documentElement.setAttribute(
        "data-theme",
        user.themePref || "light",
      );
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = async (newTheme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", newTheme);

    try {
      await axios.patch(
        API_ENDPOINTS.USER_THEME,
        { themePref: newTheme },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );

      // Update local state
      if (userData) {
        setUserData({ ...userData, themePref: newTheme });
      }
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  const handleHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <p>Failed to load profile</p>
        </div>
      </div>
    );
  }

  const currentTheme = userData.themePref;

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-card-modern">
          {/* Decorative Icons */}
          <div className="deco-icons">
            <div className="deco-icon icon-1">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="deco-icon icon-2">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="deco-icon icon-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="deco-icon icon-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
              </svg>
            </div>
          </div>

          {/* User Avatar */}
          <div className="profile-photo">
            <div className="photo-circle">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* User Info */}
          <div className="profile-header">
            <h1> {userData.name}</h1>
            <p className="profile-subtitle">MUSIC ENTHUSIAST</p>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {new Date(userData.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="theme-section-modern">
            <span className="section-title">APPEARANCE</span>
            <div className="theme-buttons">
              <button
                className={`theme-option ${currentTheme === "light" ? "active" : ""}`}
                onClick={() => handleThemeToggle("light")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
                className={`theme-option ${currentTheme === "dark" ? "active" : ""}`}
                onClick={() => handleThemeToggle("dark")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Dark
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleHome}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
            <button className="btn-primary" onClick={handleLogout}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
