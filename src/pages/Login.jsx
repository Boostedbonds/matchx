import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithMagicLink } from "../services/auth";
import "./Login.css";

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
      const response = await loginWithMagicLink(email);
      
      if (response?.success) {
        setMessage("✓ Magic link sent! Check your email");
        setEmail("");
        
        // Optional: Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
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
              type="email"
              placeholder="your@email.com"
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
            {loading ? "Sending..." : "Send Magic Link"}
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