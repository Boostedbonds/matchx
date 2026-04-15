import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithMagicLink } from "../services/auth";
import "./Login.css";

// 🔐 CHANGE THIS CODE
const ACCESS_CODE = "MATCHX2026";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ✅ ACCESS CODE LOGIN (BETA MODE)
      if (email.trim() === ACCESS_CODE) {
        localStorage.setItem("access_granted", "true");
        setMessage("✓ Access granted");
        
        // redirect instantly
        navigate("/dashboard"); // change if your route is different
        return;
      }

      // ✅ EMAIL LOGIN (SUPABASE)
      const response = await loginWithMagicLink(email);

      if (response?.success) {
        setMessage("✓ Magic link sent! Check your email");
        setEmail("");
      } else {
        setError(response?.message || "Failed to send magic link");
      }
    } catch (err) {
      setError(err.message || "Error sending magic link. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-grid-overlay"></div>

      <div className="login-content">
        <div className="login-header">
          <div className="login-label">🏸 Badminton Live Scoring Platform</div>
          <h1 className="login-title">
            MATCH<span className="login-x">X</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Enter your email</label>
            <input
              id="email"
              type="text"   // 👈 changed from email → allows access code input
              placeholder="your@email.com or access code"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-magic-link"
            disabled={loading}
          >
            {loading ? "Sending..." : "ENTER ARENA"}
          </button>
        </form>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="login-info">
          <p>We'll send you a magic link to sign in. No password needed.</p>
        </div>

        <div className="login-footer">
          <span onClick={() => navigate("/")} className="back-link">
            ← Back to home
          </span>
        </div>
      </div>
    </div>
  );
}