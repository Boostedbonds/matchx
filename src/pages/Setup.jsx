import { useState } from "react";

function Setup({ onStartMatch, onBack }) {
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [matchType, setMatchType] = useState("singles");
  const [gameCount, setGameCount] = useState(3);
  const [players, setPlayers] = useState({ A1: "", A2: "", B1: "", B2: "" });

  const handleChange = (key, value) => setPlayers({ ...players, [key]: value });

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .setup-wrap {
          width: 100%; max-width: 900px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .setup-header { text-align: center; margin-bottom: 48px; }

        .setup-badge {
          display: inline-block;
          font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 4px;
          text-transform: uppercase; color: rgba(0,255,200,0.7);
          border: 1px solid rgba(0,255,200,0.2); padding: 6px 16px;
          margin-bottom: 16px;
        }

        .setup-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px; letter-spacing: 6px; color: #fff;
          line-height: 1;
        }

        .setup-title span { color: #00ffc8; text-shadow: 0 0 30px rgba(0,255,200,0.5); }

        .match-type-row {
          display: flex; gap: 12px; margin-bottom: 32px; justify-content: center;
        }

        .type-btn {
          padding: 12px 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          transition: all 0.2s;
        }

        .type-btn.active {
          background: rgba(0,255,200,0.08);
          border-color: rgba(0,255,200,0.4);
          color: #00ffc8;
          box-shadow: 0 0 20px rgba(0,255,200,0.1);
        }

        .type-btn:hover:not(.active) {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }

        .teams-wrap {
          display: grid; grid-template-columns: 1fr 80px 1fr;
          gap: 0; margin-bottom: 32px;
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .team-panel { padding: 32px; }

        .vs-divider {
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,255,200,0.04);
          border-left: 1px solid rgba(255,255,255,0.05);
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .vs-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; color: rgba(255,255,255,0.15);
          letter-spacing: 4px;
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        .team-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(0,255,200,0.5); margin-bottom: 12px;
        }

        .team-name-input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(0,255,200,0.2);
          color: #fff;
          font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px;
          outline: none; margin-bottom: 20px;
          transition: all 0.2s;
        }

        .team-name-input:focus {
          border-color: #00ffc8;
          background: rgba(0,255,200,0.04);
          box-shadow: 0 0 15px rgba(0,255,200,0.08);
        }

        .player-input {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          font-family: 'Rajdhani', sans-serif; font-size: 14px;
          font-weight: 500; letter-spacing: 1px;
          outline: none; margin-bottom: 10px;
          transition: all 0.2s;
        }

        .player-input:focus {
          border-color: rgba(0,255,200,0.3);
          background: rgba(0,255,200,0.02);
        }

        .player-input::placeholder { color: rgba(255,255,255,0.2); }

        .options-row {
          display: flex; gap: 16px; margin-bottom: 32px;
        }

        .option-card {
          flex: 1; padding: 20px 24px;
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .option-label {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.25); margin-bottom: 12px;
        }

        .game-btns { display: flex; gap: 8px; }

        .game-btn {
          width: 48px; height: 40px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4); cursor: pointer;
          font-family: 'Bebas Neue', sans-serif; font-size: 20px;
          transition: all 0.2s;
        }

        .game-btn.active {
          background: rgba(0,255,200,0.08);
          border-color: rgba(0,255,200,0.4);
          color: #00ffc8;
        }

        .start-btn {
          width: 100%; padding: 20px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px; letter-spacing: 6px; color: #000;
          position: relative; overflow: hidden; transition: all 0.3s;
        }

        .start-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .start-btn:hover::before { left: 100%; }
        .start-btn:hover { background: #fff; box-shadow: 0 0 50px rgba(0,255,200,0.5); }
        .start-btn:active { transform: scale(0.99); }

        .back-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.25); padding: 0;
          margin-bottom: 32px; display: flex; align-items: center; gap: 8px;
          transition: color 0.2s;
        }

        .back-btn:hover { color: rgba(255,255,255,0.6); }
      `}</style>

      <div className="setup-wrap">
        <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>

        <div className="setup-header">
          <div className="setup-badge">🏸 Match Configuration</div>
          <h1 className="setup-title">Setup <span>Match</span></h1>
        </div>

        {/* Match Type */}
        <div className="match-type-row">
          {["singles", "doubles", "mixed"].map(t => (
            <button
              key={t}
              className={`type-btn ${matchType === t ? "active" : ""}`}
              onClick={() => setMatchType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Teams */}
        <div className="teams-wrap">
          <div className="team-panel">
            <div className="team-label">Team A</div>
            <input
              className="team-name-input"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
            />
            <input className="player-input" placeholder="Player 1 Name" onChange={(e) => handleChange("A1", e.target.value)} />
            {matchType !== "singles" && (
              <input className="player-input" placeholder="Player 2 Name" onChange={(e) => handleChange("A2", e.target.value)} />
            )}
          </div>

          <div className="vs-divider">
            <div className="vs-text">VS</div>
          </div>

          <div className="team-panel">
            <div className="team-label">Team B</div>
            <input
              className="team-name-input"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
            />
            <input className="player-input" placeholder="Player 1 Name" onChange={(e) => handleChange("B1", e.target.value)} />
            {matchType !== "singles" && (
              <input className="player-input" placeholder="Player 2 Name" onChange={(e) => handleChange("B2", e.target.value)} />
            )}
          </div>
        </div>

        {/* Options */}
        <div className="options-row">
          <div className="option-card">
            <div className="option-label">Best of (Games)</div>
            <div className="game-btns">
              {[1, 3, 5].map(n => (
                <button
                  key={n}
                  className={`game-btn ${gameCount === n ? "active" : ""}`}
                  onClick={() => setGameCount(n)}
                >{n}</button>
              ))}
            </div>
          </div>
          <div className="option-card">
            <div className="option-label">Points to Win</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#00ffc8", letterSpacing: 2 }}>21</div>
          </div>
          <div className="option-card">
            <div className="option-label">Deuce Rule</div>
            <div style={{ fontFamily: "'Rajdhani'", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>+2 at 20–20 · Max 30</div>
          </div>
        </div>

        <button
          className="start-btn"
          onClick={() => onStartMatch({ teamA, teamB, players, matchType, gameCount })}
        >
          🏸 Start Match
        </button>
      </div>
    </div>
  );
}

export default Setup;