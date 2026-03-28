import { useState, useEffect } from "react";

function RoleSelector({ onSelectScorer, onSelectSpectator, onBack, context }) {
  const [hovered, setHovered] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 60);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rs-bg-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(0,255,200,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .rs-wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 820px;
          opacity: 0; transform: translateY(24px);
          transition: all 0.6s ease;
        }

        .rs-wrap.loaded { opacity: 1; transform: translateY(0); }

        .rs-back {
          background: none; border: none; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.25); padding: 0;
          margin-bottom: 36px; display: flex; align-items: center; gap: 8px;
          transition: color 0.2s;
        }

        .rs-back:hover { color: rgba(255,255,255,0.6); }

        .rs-header { text-align: center; margin-bottom: 48px; }

        .rs-context {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
          color: rgba(0,255,200,0.6);
          border: 1px solid rgba(0,255,200,0.15);
          padding: 5px 16px; display: inline-block; margin-bottom: 20px;
        }

        .rs-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 8vw, 72px);
          letter-spacing: 6px; color: #fff; line-height: 1;
          margin-bottom: 10px;
        }

        .rs-title span { color: #00ffc8; text-shadow: 0 0 30px rgba(0,255,200,0.4); }

        .rs-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
        }

        .rs-cards {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .rs-card {
          position: relative; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; transition: all 0.3s;
          padding: 40px 36px;
          background: #0d0f15;
        }

        .rs-card::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.3s;
          pointer-events: none;
        }

        .rs-card.scorer::before {
          background: radial-gradient(ellipse at 30% 30%, rgba(0,255,200,0.08), transparent 60%);
        }

        .rs-card.spectator::before {
          background: radial-gradient(ellipse at 30% 30%, rgba(0,136,255,0.08), transparent 60%);
        }

        .rs-card:hover::before { opacity: 1; }

        .rs-card.scorer:hover {
          border-color: rgba(0,255,200,0.3);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,255,200,0.08);
        }

        .rs-card.spectator:hover {
          border-color: rgba(0,136,255,0.3);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,136,255,0.08);
        }

        .rs-card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 28px;
        }

        .rs-icon {
          font-size: 52px; line-height: 1;
          filter: drop-shadow(0 0 16px currentColor);
        }

        .rs-badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px; font-weight: 700;
          text-transform: uppercase; padding: 4px 12px;
          border: 1px solid; border-radius: 2px;
        }

        .rs-badge.scorer { color: #00ffc8; border-color: rgba(0,255,200,0.3); background: rgba(0,255,200,0.06); }
        .rs-badge.spectator { color: #0088ff; border-color: rgba(0,136,255,0.3); background: rgba(0,136,255,0.06); }

        .rs-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px; letter-spacing: 4px;
          line-height: 1; margin-bottom: 10px;
        }

        .rs-card-title.scorer { color: #00ffc8; text-shadow: 0 0 20px rgba(0,255,200,0.3); }
        .rs-card-title.spectator { color: #0088ff; text-shadow: 0 0 20px rgba(0,136,255,0.3); }

        .rs-card-desc {
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.4); line-height: 1.6;
          letter-spacing: 0.3px; margin-bottom: 28px;
        }

        .rs-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }

        .rs-feature {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 1px;
          color: rgba(255,255,255,0.5);
        }

        .rs-feature-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }

        .rs-feature-dot.scorer { background: #00ffc8; box-shadow: 0 0 6px #00ffc8; }
        .rs-feature-dot.spectator { background: #0088ff; box-shadow: 0 0 6px #0088ff; }

        .rs-btn {
          width: 100%; padding: 16px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px;
          border: none; cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }

        .rs-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .rs-btn:hover::after { left: 100%; }

        .rs-btn.scorer {
          background: #00ffc8; color: #000;
        }

        .rs-btn.scorer:hover {
          background: #fff;
          box-shadow: 0 0 40px rgba(0,255,200,0.5);
        }

        .rs-btn.spectator {
          background: #0088ff; color: #fff;
        }

        .rs-btn.spectator:hover {
          background: #33aaff;
          box-shadow: 0 0 40px rgba(0,136,255,0.5);
        }

        .rs-divider {
          display: flex; align-items: center;
          justify-content: center; gap: 16px;
          margin: 32px 0 0;
        }

        .rs-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }

        .rs-divider-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.15);
        }

        @media (max-width: 600px) {
          .rs-cards { grid-template-columns: 1fr; }
          .rs-card { padding: 28px 24px; }
        }
      `}</style>

      {/* Grid bg */}
      <div className="rs-bg-grid" />

      <div className={`rs-wrap ${loaded ? "loaded" : ""}`}>
        <button className="rs-back" onClick={onBack}>← Back</button>

        <div className="rs-header">
          <div className="rs-context">
            {context === "match" ? "🏸 Starting a Match" : "📡 Joining a Match"}
          </div>
          <div className="rs-title">Choose Your <span>Role</span></div>
          <div className="rs-sub">Select how you want to participate in this match</div>
        </div>

        <div className="rs-cards">

          {/* SCORER */}
          <div
            className="rs-card scorer"
            onMouseEnter={() => setHovered("scorer")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-card-top">
              <div className="rs-icon">🎙</div>
              <div className="rs-badge scorer">Full Control</div>
            </div>

            <div className="rs-card-title scorer">Scorer</div>
            <div className="rs-card-desc">
              You run the match. Score points, add live commentary by voice or tap, and broadcast the game to spectators.
            </div>

            <div className="rs-features">
              {[
                "Score points for both teams",
                "Voice commentary — English & Hinglish",
                "Auto-generated + manual commentary mix",
                "Mic commands: smash, fault, deuce & more",
                "Stream match via phone camera",
                "Full match control — reset, next game",
              ].map((f, i) => (
                <div key={i} className="rs-feature">
                  <div className="rs-feature-dot scorer" />
                  {f}
                </div>
              ))}
            </div>

            <button className="rs-btn scorer" onClick={onSelectScorer}>
              Enter as Scorer →
            </button>
          </div>

          {/* SPECTATOR */}
          <div
            className="rs-card spectator"
            onMouseEnter={() => setHovered("spectator")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-card-top">
              <div className="rs-icon">👁</div>
              <div className="rs-badge spectator">View Only</div>
            </div>

            <div className="rs-card-title spectator">Spectator</div>
            <div className="rs-card-desc">
              Sit back and watch. See the live score, camera stream from the court, and real-time commentary as it happens.
            </div>

            <div className="rs-features">
              {[
                "Live scoreboard updated in real time",
                "Camera stream from scorer's phone",
                "Live commentary feed",
                "Match stats — smashes, rallies, faults",
                "Switch between ongoing matches",
                "No login required to watch",
              ].map((f, i) => (
                <div key={i} className="rs-feature">
                  <div className="rs-feature-dot spectator" />
                  {f}
                </div>
              ))}
            </div>

            <button className="rs-btn spectator" onClick={onSelectSpectator}>
              Enter as Spectator →
            </button>
          </div>

        </div>

        <div className="rs-divider">
          <div className="rs-divider-line" />
          <div className="rs-divider-text">Only one scorer per match · unlimited spectators</div>
          <div className="rs-divider-line" />
        </div>
      </div>
    </div>
  );
}

export default RoleSelector;