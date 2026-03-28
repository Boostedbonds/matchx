import { useState, useEffect, useRef } from "react";
import useMatchStore from "../store/matchStore";

const COMMENTARY = [
  "Powerful smash from Team A!",
  "Brilliant net shot!",
  "What a rally! Both teams fighting hard.",
  "Service ace! Clean and precise.",
  "Incredible backhand return!",
  "DEUCE! This is intense!",
  "Match point coming up!",
  "Spectacular jump smash!",
  "Drop shot catches the opponent off guard!",
  "Both players showing tremendous stamina!",
];

function OverlayUI({ matchData, onBack }) {
  const { playerA, playerB, winner, scoreA, scoreB, reset } = useMatchStore();
  const [commentary, setCommentary] = useState(["Match started! Both teams ready."]);
  const [game, setGame] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const commRef = useRef(null);

  useEffect(() => {
    if (winner) setShowWinner(true);
  }, [winner]);

  const addScore = (team, fn) => {
    fn();
    const msg = `${matchData?.[`team${team}`] || `Team ${team}`} scores! ${COMMENTARY[Math.floor(Math.random() * COMMENTARY.length)]}`;
    setCommentary(prev => [msg, ...prev].slice(0, 8));
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        .overlay-top {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 20px 24px;
          background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
          pointer-events: auto;
        }

        .scoreboard {
          display: flex; align-items: stretch;
          max-width: 680px; margin: 0 auto;
          background: rgba(8,10,15,0.92);
          border: 1px solid rgba(0,255,200,0.2);
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(0,255,200,0.1);
          overflow: hidden;
        }

        .team-score {
          flex: 1; padding: 20px 24px;
          text-align: center;
          position: relative;
        }

        .team-score.active {
          background: rgba(0,255,200,0.04);
        }

        .team-score::after {
          content: '';
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 3px;
          background: #00ffc8;
          transition: width 0.3s;
        }

        .team-score.active::after { width: 100%; }

        .team-title {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.35); margin-bottom: 4px;
        }

        .team-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 2px; color: #fff;
          margin-bottom: 4px;
        }

        .team-players {
          font-size: 10px; color: rgba(255,255,255,0.25);
          letter-spacing: 1px; margin-bottom: 16px;
        }

        .score-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 72px; line-height: 1; color: #00ffc8;
          text-shadow: 0 0 30px rgba(0,255,200,0.4);
          margin-bottom: 16px;
        }

        .score-btn {
          padding: 10px 28px;
          background: rgba(0,255,200,0.1);
          border: 1px solid rgba(0,255,200,0.3);
          color: #00ffc8; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 2px;
          transition: all 0.2s;
          pointer-events: auto;
        }

        .score-btn:hover {
          background: #00ffc8; color: #000;
          box-shadow: 0 0 20px rgba(0,255,200,0.4);
        }

        .score-btn:active { transform: scale(0.95); }

        .mid-panel {
          width: 120px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 16px 8px; gap: 8px;
        }

        .vs-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 3px;
          color: rgba(255,255,255,0.15);
        }

        .game-label {
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .game-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: #fff; line-height: 1;
        }

        .live-dot-wrap {
          display: flex; align-items: center; gap: 6px;
        }

        .live-dot {
          width: 6px; height: 6px;
          background: #ff3250; border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .live-text {
          font-size: 10px; letter-spacing: 2px;
          color: #ff3250; font-weight: 700;
        }

        .reset-btn {
          padding: 8px 14px;
          background: rgba(255,50,80,0.1);
          border: 1px solid rgba(255,50,80,0.2);
          color: rgba(255,50,80,0.7); cursor: pointer;
          font-size: 10px; letter-spacing: 2px;
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          text-transform: uppercase; transition: all 0.2s;
          pointer-events: auto;
        }

        .reset-btn:hover { background: rgba(255,50,80,0.2); color: #ff3250; }

        /* Commentary */
        .commentary-panel {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0 24px 24px;
          background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%);
          pointer-events: none;
        }

        .comm-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
        }

        .comm-label {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.3); font-weight: 700;
        }

        .comm-line {
          height: 1px; flex: 1;
          background: rgba(255,255,255,0.08);
        }

        .comm-item {
          font-size: 13px; font-weight: 600; letter-spacing: 0.5px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s;
          color: rgba(255,255,255,0.6);
        }

        .comm-item:first-child {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }

        /* Back Button */
        .back-btn {
          position: absolute; top: 20px; left: 20px;
          background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); cursor: pointer; padding: 8px 16px;
          font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; pointer-events: auto; transition: all 0.2s;
        }

        .back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

        /* Winner Overlay */
        .winner-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          pointer-events: auto;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .winner-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 100px; letter-spacing: 8px; color: #00ffc8;
          text-shadow: 0 0 60px rgba(0,255,200,0.6);
          line-height: 1; animation: pulse 1s ease infinite;
        }

        @keyframes pulse { 0%, 100% { text-shadow: 0 0 60px rgba(0,255,200,0.6); } 50% { text-shadow: 0 0 100px rgba(0,255,200,0.9); } }

        .winner-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; letter-spacing: 6px;
          color: rgba(255,255,255,0.5); text-transform: uppercase;
          margin: 16px 0 40px;
        }

        .new-match-btn {
          padding: 16px 48px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; letter-spacing: 4px; color: #000;
          transition: all 0.3s;
        }

        .new-match-btn:hover { background: #fff; box-shadow: 0 0 50px rgba(0,255,200,0.5); }
      `}</style>

      {/* Back Button */}
      {onBack && <button className="back-btn" onClick={onBack}>← Dashboard</button>}

      {/* Top Scoreboard */}
      <div className="overlay-top">
        <div className="scoreboard">
          {/* Team A */}
          <div className={`team-score ${playerA > playerB ? "active" : ""}`}>
            <div className="team-title">Team A</div>
            <div className="team-name">{matchData?.teamA || "Team A"}</div>
            <div className="team-players">{matchData?.players?.A1} {matchData?.players?.A2 ? `/ ${matchData.players.A2}` : ""}</div>
            <div className="score-num">{playerA}</div>
            <button className="score-btn" onClick={() => addScore("A", scoreA)}>+ POINT</button>
          </div>

          {/* Mid */}
          <div className="mid-panel">
            <div className="live-dot-wrap">
              <div className="live-dot" />
              <div className="live-text">LIVE</div>
            </div>
            <div className="vs-label">VS</div>
            <div className="game-label">Game</div>
            <div className="game-num">{game}</div>
            <button className="reset-btn" onClick={reset}>Reset</button>
          </div>

          {/* Team B */}
          <div className={`team-score ${playerB > playerA ? "active" : ""}`}>
            <div className="team-title">Team B</div>
            <div className="team-name">{matchData?.teamB || "Team B"}</div>
            <div className="team-players">{matchData?.players?.B1} {matchData?.players?.B2 ? `/ ${matchData.players.B2}` : ""}</div>
            <div className="score-num">{playerB}</div>
            <button className="score-btn" onClick={() => addScore("B", scoreB)}>+ POINT</button>
          </div>
        </div>
      </div>

      {/* Commentary */}
      <div className="commentary-panel">
        <div className="comm-header">
          <div className="comm-label">🎙 Commentary</div>
          <div className="comm-line" />
        </div>
        {commentary.slice(0, 4).map((c, i) => (
          <div key={i} className="comm-item">{c}</div>
        ))}
      </div>

      {/* Winner */}
      {showWinner && (
        <div className="winner-overlay">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div className="winner-title">{winner}</div>
          <div className="winner-sub">Match Complete · GG WP</div>
          <button className="new-match-btn" onClick={() => { reset(); setShowWinner(false); onBack?.(); }}>
            New Match
          </button>
        </div>
      )}
    </div>
  );
}

export default OverlayUI;