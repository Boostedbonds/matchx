import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Cover.css";

export default function Cover() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const result = await login(email);
      if (result.success) {
        setMessage("Magic link sent! Check your email.");
        setEmail("");
      } else {
        setMessage(result.error || "Error sending magic link");
      }
    } catch (err) {
      setMessage("Error processing email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cover-container">
      <div className="background"></div>
      <div className="grid-overlay"></div>

      {/* Badminton Court Lines - SVG */}
      <svg
        className="badminton-lines"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Outer rectangle */}
        <rect
          x="150"
          y="200"
          width="700"
          height="600"
          fill="none"
          stroke="rgba(255, 200, 0, 0.3)"
          strokeWidth="3"
        />

        {/* Center line */}
        <line
          x1="500"
          y1="200"
          x2="500"
          y2="800"
          stroke="rgba(255, 200, 0, 0.25)"
          strokeWidth="2"
        />

        {/* Service line */}
        <line
          x1="150"
          y1="350"
          x2="850"
          y2="350"
          stroke="rgba(255, 200, 0, 0.2)"
          strokeWidth="2"
        />
        <line
          x1="150"
          y1="650"
          x2="850"
          y2="650"
          stroke="rgba(255, 200, 0, 0.2)"
          strokeWidth="2"
        />

        {/* Side lines */}
        <line
          x1="200"
          y1="200"
          x2="200"
          y2="800"
          stroke="rgba(255, 200, 0, 0.15)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <line
          x1="800"
          y1="200"
          x2="800"
          y2="800"
          stroke="rgba(255, 200, 0, 0.15)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Center circle */}
        <circle
          cx="500"
          cy="500"
          r="80"
          fill="none"
          stroke="rgba(255, 200, 0, 0.4)"
          strokeWidth="2"
        />
      </svg>

      {/* Concentric circles background */}
      <div className="badminton-court">
        <div className="court-inner"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <div className="header-label">🏸 Badminton Live Scoring Platform</div>
        <h1 className="title">
          MATCH<span className="x">X</span>
        </h1>
        <p className="subtitle">Professional match management</p>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="email-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-enter" disabled={loading}>
            {loading ? "Sending..." : "SEND MAGIC LINK"}
          </button>
        </form>

        {/* Messages */}
        {message && (
          <div
            className={`message ${
              message.includes("Error") || message.includes("Please")
                ? "error"
                : "success"
            }`}
          >
            {message}
          </div>
        )}

        {/* Info Text */}
        <div className="info-text">
          <div>✓ Magic link authentication - No password needed</div>
          <div>New player? Email verified, profile created automatically</div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="footer-nav">
        <div className="nav-items">
          <span>Live Score</span>
          <span>Commentary</span>
          <span>Rankings</span>
          <span>Player Stats</span>
        </div>
        <div className="season-info">MatchX v1.0 - Season 2026</div>
      </div>
    </div>
  );
}