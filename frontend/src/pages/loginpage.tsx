import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light"
    );
  });
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";
    setTheme(currentTheme);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(API_ENDPOINTS.LOGIN, { email, password });
      auth?.login(res.data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bgGradient =
    theme === "light"
      ? "linear-gradient(135deg, #f8b4d9 0%, #f4d4ba 100%)"
      : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";

  const cardBg =
    theme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 20, 25, 0.95)";

  const textColor = theme === "light" ? "#2d3748" : "#e2e8f0";
  const mutedColor = theme === "light" ? "#718096" : "#a0aec0";
  const accentColor = theme === "light" ? "#ff6b9d" : "#9f7aea";
  const inputBg = theme === "light" ? "#ffffff" : "#1a1a2e";
  const inputBorder =
    theme === "light" ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: bgGradient,
        transition: "background 0.3s ease",
      }}
    >
      <div
        style={{
          background: cardBg,
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              color: textColor,
              fontSize: "2rem",
              margin: "0 0 0.5rem 0",
              fontWeight: 600,
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: mutedColor, fontSize: "0.95rem", margin: 0 }}>
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {error && (
            <div
              style={{
                background: "rgba(255, 107, 157, 0.1)",
                border: `1px solid ${accentColor}`,
                color: accentColor,
                padding: "0.875rem",
                borderRadius: "12px",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              htmlFor="email"
              style={{ color: textColor, fontSize: "0.9rem", fontWeight: 500 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                padding: "0.875rem",
                border: `1px solid ${inputBorder}`,
                borderRadius: "12px",
                fontSize: "1rem",
                background: inputBg,
                color: textColor,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = inputBorder)}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label
              htmlFor="password"
              style={{ color: textColor, fontSize: "0.9rem", fontWeight: 500 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                padding: "0.875rem",
                border: `1px solid ${inputBorder}`,
                borderRadius: "12px",
                fontSize: "1rem",
                background: inputBg,
                color: textColor,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = inputBorder)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: accentColor,
              color: "white",
              border: "none",
              padding: "1rem",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
              marginTop: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            paddingTop: "1.5rem",
            borderTop: `1px solid ${inputBorder}`,
          }}
        >
          <p style={{ color: mutedColor, fontSize: "0.9rem", margin: 0 }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: accentColor,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
