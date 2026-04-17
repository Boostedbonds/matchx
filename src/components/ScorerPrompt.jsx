/**
 * ScorerPrompt.jsx
 * src/components/ScorerPrompt.jsx
 *
 * Modal shown when a user tries to start a match.
 * Asks if they want to take on the scorer role for this match.
 * Default answer is spectator — they must actively choose scorer.
 */

import { useEffect, useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .sp-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: sp-fade-in 0.2s ease;
  }

  @keyframes sp-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .sp-card {
    background: #0d0f15;
    border: 1px solid rgba(0, 255, 200, 0.15);
    max-width: 480px; width: 100%;
    padding: 40px 36px;
    position: relative;
    animation: sp-slide-up 0.25s ease;
  }

  @keyframes sp-slide-up {
    from { transform: translateY(16px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .sp-corner {
    position: absolute; width: 16px; height: 16px;
    border-color: rgba(0, 255, 200, 0.4); border-style: solid;
  }
  .sp-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
  .sp-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
  .sp-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
  .sp-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

  .sp-icon {
    font-size: 40px; margin-bottom: 16px; line-height: 1;
    display: block;
  }

  .sp-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(0, 255, 200, 0.6);
    margin-bottom: 10px;
  }

  .sp-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; letter-spacing: 0.06em; line-height: 1;
    color: #fff; margin-bottom: 14px;
  }

  .sp-title span { color: #00ffc8; }

  .sp-desc {
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px; font-weight: 500; line-height: 1.65;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 28px;
  }

  .sp-roles {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 28px;
  }

  .sp-role {
    border: 1px solid; padding: 18px 14px;
    cursor: pointer; transition: all 0.2s;
    text-align: left; background: transparent;
  }

  .sp-role.scorer {
    border-color: rgba(0, 255, 200, 0.2);
    color: #00ffc8;
  }
  .sp-role.scorer:hover, .sp-role.scorer.selected {
    background: rgba(0, 255, 200, 0.07);
    border-color: rgba(0, 255, 200, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 200, 0.08);
  }

  .sp-role.spectator {
    border-color: rgba(0, 136, 255, 0.2);
    color: #0088ff;
  }
  .sp-role.spectator:hover, .sp-role.spectator.selected {
    background: rgba(0, 136, 255, 0.07);
    border-color: rgba(0, 136, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 136, 255, 0.08);
  }

  .sp-role-icon {
    font-size: 22px; display: block; margin-bottom: 8px;
  }

  .sp-role-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.08em;
    display: block; margin-bottom: 4px;
  }

  .sp-role-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255, 255, 255, 0.3);
    display: block;
  }

  .sp-confirm-btn {
    width: 100%; padding: 16px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 0.12em;
    border: none; cursor: pointer;
    transition: all 0.2s;
  }

  .sp-confirm-btn.scorer {
    background: #00ffc8; color: #000;
  }
  .sp-confirm-btn.scorer:hover {
    background: #fff; box-shadow: 0 0 30px rgba(0, 255, 200, 0.3);
  }

  .sp-confirm-btn.spectator {
    background: #0088ff; color: #fff;
  }
  .sp-confirm-btn.spectator:hover {
    background: #33aaff; box-shadow: 0 0 30px rgba(0, 136, 255, 0.3);
  }

  .sp-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255, 255, 255, 0.18);
    text-align: center; margin-top: 14px;
  }
`;

export default function ScorerPrompt({ onConfirm, onDecline }) {
  const [selected, setSelected] = useState("scorer"); // default highlight scorer

  function handleConfirm() {
    if (selected === "scorer") {
      onConfirm();
    } else {
      onDecline();
    }
  }

  // Allow escape key to dismiss as spectator
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onDecline();
      if (e.key === "Enter") handleConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="sp-overlay">
        <div className="sp-card">
          <div className="sp-corner sp-tl" />
          <div className="sp-corner sp-tr" />
          <div className="sp-corner sp-bl" />
          <div className="sp-corner sp-br" />

          <span className="sp-icon">🏸</span>
          <div className="sp-label">Match Starting</div>
          <div className="sp-title">Join as <span>Scorer</span> or Spectator?</div>
          <div className="sp-desc">
            Scorers control the match — tap points, undo, and end the game. Anyone can take over scoring later via QR handoff. Spectators just watch live.
          </div>

          <div className="sp-roles">
            <button
              className={`sp-role scorer ${selected === "scorer" ? "selected" : ""}`}
              onClick={() => setSelected("scorer")}
            >
              <span className="sp-role-icon">🎙</span>
              <span className="sp-role-name">Scorer</span>
              <span className="sp-role-desc">Full control</span>
            </button>

            <button
              className={`sp-role spectator ${selected === "spectator" ? "selected" : ""}`}
              onClick={() => setSelected("spectator")}
            >
              <span className="sp-role-icon">👁</span>
              <span className="sp-role-name">Spectator</span>
              <span className="sp-role-desc">Watch only</span>
            </button>
          </div>

          <button
            className={`sp-confirm-btn ${selected}`}
            onClick={handleConfirm}
          >
            {selected === "scorer" ? "Enter as Scorer →" : "Watch as Spectator →"}
          </button>

          <div className="sp-hint">
            Scorer can hand off to another phone anytime · Esc to watch
          </div>
        </div>
      </div>
    </>
  );
}