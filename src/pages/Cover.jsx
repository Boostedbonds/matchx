import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Cover.css";

export default function Cover() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleEnterArena = () => {
    setShowEmailForm(true);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      navigate("/login", { state: { email } });
    }
  };

  return (
    <div className="cover-container">
      <div className="background"></div>
      <div className="grid-overlay"></div>
      
      {/* Badminton Court Visualization */}
      <div className="badminton-court">
        <div className="court-inner"></div>
      </div>

      <div className="content">
        <div className="header-label">🏸 Badminton Live Scoring Platform</div>
        <h1 className="title">
          MATCH<span className="x">X</span>
        </h1>
        <p className="subtitle">Professional match management</p>

        {!showEmailForm ? (
          <>
            <div className="form-group">
              <input type="text" placeholder="Shaurya Kataria" readOnly />
              <input type="password" placeholder="••••" readOnly />
            </div>

            <button className="btn-enter" onClick={handleEnterArena}>
              ENTER ARENA
            </button>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit} className="email-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-enter">
              SEND MAGIC LINK
            </button>
            <button
              type="button"
              className="btn-back"
              onClick={() => {
                setShowEmailForm(false);
                setEmail("");
              }}
            >
              ← BACK
            </button>
          </form>
        )}

        <div className="info-text">
          <div>✓ Magic link authentication - No password needed</div>
          <div>New player? Email verified, profile created automatically</div>
        </div>
      </div>

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