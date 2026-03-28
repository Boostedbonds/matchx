import { useState, useEffect } from "react";

// RoleSelect is shown BEFORE each match starts — not after login.
// onSelect(role) → "scorer" | "spectator"
// onCancel()     → go back to dashboard without starting a match

function RoleSelect({ onSelect, onCancel }) {
  const [loaded,  setLoaded]  = useState(false);
  const [hovered, setHovered] = useState(null);
  const [chosen,  setChosen]  = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  function handlePick(role) {
    setChosen(role);
    setTimeout(() => onSelect(role), 480);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#04060a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rs-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(0,255,200,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.025) 1px, transparent 1px);
          background-size: 64px 64px; pointer-events: none;
        }

        .rs-glow {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,255,200,0.04) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .rs-wrap {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 700px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .rs-wrap.loaded { opacity: 1; transform: translateY(0); }

        /* ── Header ── */
        .rs-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 6px; color: #fff; margin-bottom: 8px;
        }
        .rs-logo span { color: #00ffc8; text-shadow: 0 0 16px rgba(0,255,200,0.5); }

        /* Match context pill */
        .rs-match-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,184,0,0.08);
          border: 1px solid rgba(255,184,0,0.2);
          padding: 5px 14px; margin-bottom: 28px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; color: #ffb800;
        }
        .rs-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: #ffb800; animation: blink 1.5s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .rs-question {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 6vw, 48px);
          letter-spacing: 3px; color: #fff;
          text-align: center; margin-bottom: 6px; line-height: 1;
        }

        .rs-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; letter-spacing: 3px;
          color: rgba(255,255,255,0.22); text-transform: uppercase;
          text-align: center; margin-bottom: 44px;
        }

        /* ── Cards ── */
        .rs-cards {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; width: 100%;
        }
        @media (max-width: 540px) { .rs-cards { grid-template-columns: 1fr; } }

        .rs-card {
          position: relative; overflow: hidden;
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 32px 26px 28px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; align-items: flex-start;
        }

        /* Top accent bar */
        .rs-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.28s ease;
        }
        .rs-card.hov::before,
        .rs-card.chosen::before { transform: scaleX(1); }

        /* Corner radiance */
        .rs-card::after {
          content: ''; position: absolute; top: -50px; right: -50px;
          width: 150px; height: 150px; border-radius: 50%;
          background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.28s;
        }
        .rs-card.hov::after,
        .rs-card.chosen::after { opacity: 1; }

        .rs-card.hov {
          border-color: var(--border);
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.45);
        }

        .rs-card.chosen {
          border-color: var(--accent) !important;
          transform: scale(0.97) !important;
        }

        /* Internals */
        .rs-icon { font-size: 42px; margin-bottom: 18px; line-height: 1; }

        .rs-role {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 34px; letter-spacing: 3px; color: #fff;
          margin-bottom: 4px; line-height: 1;
        }

        .rs-tagline {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--accent); margin-bottom: 16px;
        }

        .rs-desc {
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.38); line-height: 1.6;
          margin-bottom: 22px;
        }

        .rs-features { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 24px; }

        .rs-feat {
          display: flex; align-items: center; gap: 9px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.32);
        }
        .rs-feat-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); opacity: 0.7; flex-shrink: 0; }

        .rs-cta {
          width: 100%; padding: 13px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--accent); cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 17px; letter-spacing: 3px;
          transition: background 0.2s, color 0.2s;
          pointer-events: none;
        }
        .rs-card.hov   .rs-cta { background: var(--accent); color: #04060a; }
        .rs-card.chosen .rs-cta { background: var(--accent); color: #04060a; }

        /* ── Cancel ── */
        .rs-cancel {
          margin-top: 28px;
          background: none; border: none;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.18); cursor: pointer;
          transition: color 0.2s; padding: 6px 0;
        }
        .rs-cancel:hover { color: rgba(255,255,255,0.5); }

        .rs-note {
          margin-top: 14px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 2px;
          color: rgba(255,255,255,0.12); text-transform: uppercase;
          text-align: center;
        }

        /* Corner deco */
        .rs-corner { position: fixed; width: 44px; height: 44px; border-color: rgba(0,255,200,0.08); border-style: solid; z-index: 5; }
        .rs-tl { top: 18px; left: 18px; border-width: 1px 0 0 1px; }
        .rs-tr { top: 18px; right: 18px; border-width: 1px 1px 0 0; }
        .rs-bl { bottom: 18px; left: 18px; border-width: 0 0 1px 1px; }
        .rs-br { bottom: 18px; right: 18px; border-width: 0 1px 1px 0; }
      `}</style>

      <div className="rs-grid"/>
      <div className="rs-glow"/>
      <div className="rs-corner rs-tl"/>
      <div className="rs-corner rs-tr"/>
      <div className="rs-corner rs-bl"/>
      <div className="rs-corner rs-br"/>

      <div className={`rs-wrap ${loaded ? "loaded" : ""}`}>

        <div className="rs-logo">Match<span>X</span></div>

        {/* Per-match context — makes it clear this is for THIS match */}
        <div className="rs-match-pill">
          <div className="rs-pill-dot"/>
          New Match · Choose your role
        </div>

        <div className="rs-question">How are you in this match?</div>
        <div className="rs-sub">Pick your role · Changes each match · No re-login needed</div>

        <div className="rs-cards">

          {/* ── SCORER ── */}
          <div
            className={`rs-card ${hovered === "scorer" ? "hov" : ""} ${chosen === "scorer" ? "chosen" : ""}`}
            style={{ "--accent": "#00ffc8", "--glow": "rgba(0,255,200,0.1)", "--border": "rgba(0,255,200,0.22)" }}
            onClick={() => handlePick("scorer")}
            onMouseEnter={() => setHovered("scorer")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-icon">🎯</div>
            <div className="rs-role">Scorer</div>
            <div className="rs-tagline">Referee · Match Official</div>
            <div className="rs-desc">
              You're running the board. Record every point, pick the shot type, drive the commentary.
            </div>
            <div className="rs-features">
              {["Award & undo points", "Select shot per rally", "Live commentary generation", "Full match statistics"].map(f => (
                <div className="rs-feat" key={f}><div className="rs-feat-dot"/>{f}</div>
              ))}
            </div>
            <button className="rs-cta">
              {chosen === "scorer" ? "✓ Starting..." : "Score This Match →"}
            </button>
          </div>

          {/* ── SPECTATOR ── */}
          <div
            className={`rs-card ${hovered === "spectator" ? "hov" : ""} ${chosen === "spectator" ? "chosen" : ""}`}
            style={{ "--accent": "#ffb800", "--glow": "rgba(255,184,0,0.09)", "--border": "rgba(255,184,0,0.22)" }}
            onClick={() => handlePick("spectator")}
            onMouseEnter={() => setHovered("spectator")}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="rs-icon">👁️</div>
            <div className="rs-role">Spectator</div>
            <div className="rs-tagline">Watch · Follow Live</div>
            <div className="rs-desc">
              Just here to watch. Live scores, commentary feed, and shot stats — no controls.
            </div>
            <div className="rs-features">
              {["Live score updates", "Auto commentary feed", "Shot & rally breakdown", "Momentum tracker"].map(f => (
                <div className="rs-feat" key={f}><div className="rs-feat-dot"/>{f}</div>
              ))}
            </div>
            <button className="rs-cta">
              {chosen === "spectator" ? "✓ Joining..." : "Watch This Match →"}
            </button>
          </div>

        </div>

        {/* Cancel — go back without starting a match */}
        <button className="rs-cancel" onClick={onCancel}>
          ← Back to Dashboard
        </button>

        <div className="rs-note">
          Role is for this match only · Switch freely between matches
        </div>

      </div>
    </div>
  );
}

export default RoleSelect;