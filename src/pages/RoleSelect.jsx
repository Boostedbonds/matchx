import { useState, useEffect } from "react";

// Props expected by App.jsx:
//   onSelect(role)  — "scorer" | "spectator"
//   onCancel()      — go back to dashboard

function RoleSelect({ onSelect, onCancel }) {
  const [loaded, setLoaded] = useState(false);
  const [dark,   setDark]   = useState(true);

  useEffect(() => { setTimeout(() => setLoaded(true), 60); }, []);

  const t = {
    bg:           dark ? "#080a0f" : "#f0f4f8",
    card:         dark ? "#0d0f15" : "#ffffff",
    cardBorder:   dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    title:        dark ? "#ffffff" : "#0a0c12",
    sub:          dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
    desc:         dark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.5)",
    feature:      dark ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.55)",
    grid:         dark ? "rgba(0,255,200,0.03)"   : "rgba(0,150,120,0.04)",
    back:         dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
    divider:      dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
    dividerText:  dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)",
    toggle:       dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    toggleBorder: dark ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.12)",
    toggleText:   dark ? "rgba(255,255,255,0.4)"  : "rgba(0,0,0,0.4)",
  };

  const scorerAccent    = "#00ffc8";
  const spectatorAccent = "#0088ff";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, overflowY: "auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-y: auto; }

        .rs-bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(${t.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${t.grid} 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .rs-page {
          position: relative; z-index: 10; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          padding: 32px 24px 64px;
          opacity: 0; transform: translateY(20px); transition: all 0.5s ease;
        }
        .rs-page.loaded { opacity: 1; transform: translateY(0); }

        .rs-topbar {
          width: 100%; max-width: 860px;
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 40px;
        }

        .rs-back {
          background: none; border: none; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase;
          color: ${t.back}; padding: 0;
          display: flex; align-items: center; gap: 8px; transition: color 0.2s;
        }
        .rs-back:hover { color: ${dark ? "#fff" : "#000"}; }

        .theme-toggle {
          display: flex; align-items: center; gap: 8px;
          background: ${t.toggle}; border: 1px solid ${t.toggleBorder};
          padding: 8px 16px; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          letter-spacing: 2px; text-transform: uppercase;
          color: ${t.toggleText}; transition: all 0.2s;
        }
        .theme-toggle:hover {
          border-color: ${dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"};
          color: ${dark ? "#fff" : "#000"};
        }

        .rs-header { text-align: center; margin-bottom: 48px; }

        .rs-context {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 5px; text-transform: uppercase;
          color: ${dark ? "rgba(0,255,200,0.7)" : "rgba(0,150,120,0.8)"};
          border: 1px solid ${dark ? "rgba(0,255,200,0.15)" : "rgba(0,150,120,0.2)"};
          padding: 5px 16px; display: inline-block; margin-bottom: 20px;
        }

        .rs-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 8vw, 72px);
          letter-spacing: 6px; color: ${t.title}; line-height: 1; margin-bottom: 10px;
        }
        .rs-title span {
          color: ${scorerAccent};
          text-shadow: 0 0 30px ${dark ? "rgba(0,255,200,0.4)" : "rgba(0,200,160,0.3)"};
        }

        .rs-sub {
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          letter-spacing: 3px; color: ${t.sub}; text-transform: uppercase;
        }

        .rs-cards {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 20px; width: 100%; max-width: 860px;
        }

        .rs-card {
          position: relative; overflow: hidden;
          border: 1px solid ${t.cardBorder};
          cursor: pointer; transition: all 0.3s;
          padding: 36px 32px; background: ${t.card};
        }

        .rs-card.scorer:hover {
          border-color: rgba(0,255,200,0.35); transform: translateY(-4px);
          box-shadow: 0 16px 48px ${dark ? "rgba(0,255,200,0.08)" : "rgba(0,200,160,0.12)"};
        }
        .rs-card.spectator:hover {
          border-color: rgba(0,136,255,0.35); transform: translateY(-4px);
          box-shadow: 0 16px 48px ${dark ? "rgba(0,136,255,0.08)" : "rgba(0,100,220,0.12)"};
        }

        .rs-card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 24px;
        }

        .rs-icon { font-size: 48px; line-height: 1; }

        .rs-badge {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; font-weight: 700; text-transform: uppercase;
          padding: 4px 12px; border: 1px solid;
        }
        .rs-badge.scorer    { color: ${scorerAccent};    border-color: rgba(0,255,200,0.3); background: rgba(0,255,200,0.06); }
        .rs-badge.spectator { color: ${spectatorAccent}; border-color: rgba(0,136,255,0.3); background: rgba(0,136,255,0.06); }

        .rs-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px; letter-spacing: 4px; line-height: 1; margin-bottom: 10px;
        }
        .rs-card-title.scorer    { color: ${scorerAccent}; }
        .rs-card-title.spectator { color: ${spectatorAccent}; }

        .rs-card-desc {
          font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 500;
          color: ${t.desc}; line-height: 1.6; letter-spacing: 0.3px; margin-bottom: 24px;
        }

        .rs-features { display: flex; flex-direction: column; gap: 9px; margin-bottom: 28px; }

        .rs-feature {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 600; letter-spacing: 0.5px; color: ${t.feature};
        }
        .rs-feature-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .rs-feature-dot.scorer    { background: ${scorerAccent};    box-shadow: 0 0 6px ${scorerAccent}; }
        .rs-feature-dot.spectator { background: ${spectatorAccent}; box-shadow: 0 0 6px ${spectatorAccent}; }

        .rs-btn {
          width: 100%; padding: 16px;
          font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 4px;
          border: none; cursor: pointer;
          position: relative; overflow: hidden; transition: all 0.3s;
        }
        .rs-btn::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .rs-btn:hover::after { left: 100%; }

        .rs-btn.scorer    { background: ${scorerAccent}; color: #000; }
        .rs-btn.scorer:hover    { background: #fff; box-shadow: 0 0 40px rgba(0,255,200,0.4); }
        .rs-btn.spectator { background: ${spectatorAccent}; color: #fff; }
        .rs-btn.spectator:hover { background: #33aaff; box-shadow: 0 0 40px rgba(0,136,255,0.4); }

        .rs-divider {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          margin-top: 28px; width: 100%; max-width: 860px;
        }
        .rs-divider-line { flex: 1; height: 1px; background: ${t.divider}; }
        .rs-divider-text {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase;
          color: ${t.dividerText}; white-space: nowrap;
        }

        @media (max-width: 640px) {
          .rs-cards { grid-template-columns: 1fr; }
          .rs-card  { padding: 28px 20px; }
          .rs-title { font-size: 36px; }
        }
      `}</style>

      <div className="rs-bg-grid" />

      <div className={`rs-page ${loaded ? "loaded" : ""}`}>

        {/* Top bar */}
        <div className="rs-topbar">
          <button className="rs-back" onClick={onCancel}>← Back to Dashboard</button>
          <button className="theme-toggle" onClick={() => setDark(d => !d)}>
            {dark ? "☀️ Day Mode" : "🌙 Night Mode"}
          </button>
        </div>

        {/* Header */}
        <div className="rs-header">
          <div className="rs-context">🏸 New Match · Choose Your Role</div>
          <div className="rs-title">Choose Your <span>Role</span></div>
          <div className="rs-sub">Role is for this match only · Switch freely between matches</div>
        </div>

        {/* Cards */}
        <div className="rs-cards">

          {/* SCORER */}
          <div className="rs-card scorer" onClick={() => onSelect("scorer")}>
            <div className="rs-card-top">
              <div className="rs-icon">🎙</div>
              <div className="rs-badge scorer">Full Control</div>
            </div>
            <div className="rs-card-title scorer">Scorer</div>
            <div className="rs-card-desc">
              You run the match. Score points, pick shot types, and drive live commentary broadcast to all spectators.
            </div>
            <div className="rs-features">
              {[
                "Score points for both players",
                "Select shot type per rally",
                "Auto-generated live commentary",
                "Full match control — undo, reset",
                "Match saved to Supabase in real time",
                "Share code for spectators to join",
              ].map((f, i) => (
                <div key={i} className="rs-feature">
                  <div className="rs-feature-dot scorer" />{f}
                </div>
              ))}
            </div>
            <button className="rs-btn scorer">Enter as Scorer →</button>
          </div>

          {/* SPECTATOR */}
          <div className="rs-card spectator" onClick={() => onSelect("spectator")}>
            <div className="rs-card-top">
              <div className="rs-icon">👁</div>
              <div className="rs-badge spectator">View Only</div>
            </div>
            <div className="rs-card-title spectator">Spectator</div>
            <div className="rs-card-desc">
              Sit back and watch. See the live score and real-time commentary as it happens on any device.
            </div>
            <div className="rs-features">
              {[
                "Live scoreboard updated instantly",
                "Full commentary feed",
                "Shot & rally statistics",
                "Momentum tracker",
                "Switch between live matches",
                "No scoring controls shown",
              ].map((f, i) => (
                <div key={i} className="rs-feature">
                  <div className="rs-feature-dot spectator" />{f}
                </div>
              ))}
            </div>
            <button className="rs-btn spectator">Enter as Spectator →</button>
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

export default RoleSelect;