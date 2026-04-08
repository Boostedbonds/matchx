import { useNavigate } from "react-router-dom";
import "./Cover.css";

export default function Cover() {
  const navigate = useNavigate();

  const handleEnterArena = () => {
    navigate("/login");
  };

  return (
    <div className="cover-container">
      <div className="background"></div>
      <div className="grid-overlay"></div>
      <div className="badminton-court">
        <div className="court-inner"></div>
      </div>

      <div className="content">
        <div className="header-label">🏸 Badminton Live Scoring Platform</div>
        <h1 className="title">
          MATCH<span className="x">X</span>
        </h1>
        <p className="subtitle">Professional match management</p>

        <div className="form-group">
          <input type="text" placeholder="Shaurya Kataria" readOnly />
          <input type="password" placeholder="••••" readOnly />
        </div>

        <button className="btn-enter" onClick={handleEnterArena}>
          ENTER ARENA
        </button>

        <div className="info-text">
          <div>
            <span className="highlight">
              New row violates row-level security policy for table 'players'
            </span>
          </div>
          <div>New player? Enter your name + any code, create your profile</div>
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