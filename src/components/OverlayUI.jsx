import { useState, useEffect, useRef } from "react";
import useMatchStore from "../store/matchStore";
import VoiceScorer from "./VoiceScorer";

const HOW_SCORED = [
  { how: "Smash", icon: "💥" },
  { how: "Net Shot", icon: "🕸️" },
  { how: "Drop Shot", icon: "🪶" },
  { how: "Service Ace", icon: "⚡" },
  { how: "Backhand Return", icon: "🔄" },
  { how: "Jump Smash", icon: "🚀" },
  { how: "Cross Court", icon: "↗️" },
  { how: "Baseline Drive", icon: "🎯" },
  { how: "Opponent Error", icon: "❌" },
  { how: "Deceptive Flick", icon: "🪄" },
];

function getHow() {
  return HOW_SCORED[Math.floor(Math.random() * HOW_SCORED.length)];
}

function OverlayUI({ matchData, onBack }) {
  const { playerA, playerB, winner, scoreA, scoreB, reset } = useMatchStore();
  const [pointLog, setPointLog] = useState([]);
  const [game, setGame] = useState(1);
  const [showWinner, setShowWinner] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);

  useEffect(() => {
    if (winner) setShowWinner(true);
  }, [winner]);

  const addScore = (team, fn) => {
    fn();
    const how = getHow();
    const teamName = matchData?.[`team${team}`] || `Team ${team}`;
    const players = matchData?.players;

    // Pick which player scored (random for now, can be made manual)
    let playerName = "";
    if (team === "A") {
      playerName = players?.A2
        ? (Math.random() > 0.5 ? players.A1 : players.A2)
        : players?.A1;
    } else {
      playerName = players?.B2
        ? (Math.random() > 0.5 ? players.B1 : players.B2)
        : players?.B1;
    }

    const entry = {
      team,
      teamName,
      playerName: playerName || teamName,
      how: how.how,
      icon: how.icon,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      id: Date.now(),
    };

    setLastPoint(entry);
    setPointLog(prev => [entry, ...prev].slice(0, 20));
    setTimeout(() => setLastPoint(null), 2500);
  };

  const handleVoiceCommentary = (text) => {
    setPointLog(prev => [{ teamName: "Voice", playerName: text, how: "", icon: "🎙", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), id: Date.now() }, ...prev].slice(0, 20));
  };

  const handleVoiceScoreA = () => { scoreA(); handleVoiceCommentary(`Point to ${matchData?.teamA || "Team A"}! Voice scored.`); };
  const handleVoiceScoreB = () => { scoreB(); handleVoiceCommentary(`Point to ${matchData?.teamB || "Team B"}! Voice scored.`); };
  const handleVoiceReset = () => { reset(); setPointLog([]); };
  const handleNextGame = () => { setGame(g => g + 1); };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        .overlay-top {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 20px 16px;
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
          flex: 1; padding: 16px 12px;
          text-align: center; position: relative; min-width: 0;
        }

        .team-score.active { background: rgba(0,255,200,0.04); }

        .team-score::after {
          content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; height: 3px; background: #00ffc8; transition: width 0.3s;
        }

        .team-score.active::after { width: 100%; }

        .team-title {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.35); margin-bottom: 2px;
        }

        .team-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 2px; color: #fff;
          margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .team-players {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px; margin-bottom: 10px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .score-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px; line-height: 1; color: #00ffc8;
          text-shadow: 0 0 30px rgba(0,255,200,0.4);
          margin-bottom: 10px;
        }

        .score-btn {
          padding: 8px 20px;
          background: rgba(0,255,200,0.1);
          border: 1px solid rgba(0,255,200,0.3);
          color: #00ffc8; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; letter-spacing: 2px;
          transition: all 0.2s; pointer-events: auto;
        }

        .score-btn:hover { background: #00ffc8; color: #000; box-shadow: 0 0 20px rgba(0,255,200,0.4); }
        .score-btn:active { transform: scale(0.95); }

        .mid-panel {
          width: 90px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border-left: 1px solid rgba(255,255,255,0.06);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 12px 6px; gap: 6px; flex-shrink: 0;
        }

        .vs-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; letter-spacing: 3px; color: rgba(255,255,255,0.15);
        }

        .game-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .game-num { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #fff; line-height: 1; }

        .live-dot-wrap { display: flex; align-items: center; gap: 5px; }
        .live-dot { width: 6px; height: 6px; background: #ff3250; border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .live-text { font-size: 9px; letter-spacing: 2px; color: #ff3250; font-weight: 700; }

        .reset-btn {
          padding: 6px 10px;
          background: rgba(255,50,80,0.1); border: 1px solid rgba(255,50,80,0.2);
          color: rgba(255,50,80,0.7); cursor: pointer;
          font-size: 9px; letter-spacing: 2px;
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          text-transform: uppercase; transition: all 0.2s; pointer-events: auto;
        }

        .reset-btn:hover { background: rgba(255,50,80,0.2); color: #ff3250; }

        /* LAST POINT FLASH */
        .last-point-flash {
          position: absolute;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: rgba(8,10,15,0.97);
          border: 1px solid rgba(0,255,200,0.4);
          box-shadow: 0 0 40px rgba(0,255,200,0.2);
          padding: 20px 32px; text-align: center;
          animation: flashIn 0.3s ease, flashOut 0.4s ease 2s forwards;
          pointer-events: none; z-index: 50; min-width: 280px;
        }

        @keyframes flashIn { from { opacity: 0; transform: translate(-50%, -60%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes flashOut { from { opacity: 1; } to { opacity: 0; } }

        .flash-icon { font-size: 36px; margin-bottom: 6px; }
        .flash-player {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 3px; color: #00ffc8;
        }
        .flash-how {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; letter-spacing: 2px; color: rgba(255,255,255,0.5);
          text-transform: uppercase; margin-top: 4px;
        }
        .flash-team {
          font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.3);
          text-transform: uppercase; margin-top: 2px;
        }

        /* POINT LOG */
        .point-log-panel {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 0 16px 20px;
          background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%);
          pointer-events: none;
        }

        .log-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
        }

        .log-label {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.3); font-weight: 700; white-space: nowrap;
        }

        .log-line { height: 1px; flex: 1; background: rgba(255,255,255,0.06); }

        .log-item {
          display: flex; align-items: center; gap: 10px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .log-item:first-child { border-bottom-color: rgba(0,255,200,0.1); }

        .log-icon { font-size: 14px; flex-shrink: 0; width: 20px; text-align: center; }

        .log-info { flex: 1; min-width: 0; }

        .log-player {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .log-item:first-child .log-player { color: #00ffc8; }

        .log-how {
          font-size: 10px; letter-spacing: 1px; color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        .log-team-badge {
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          padding: 2px 8px; font-weight: 700; white-space: nowrap; flex-shrink: 0;
        }

        .log-team-A { background: rgba(0,255,200,0.08); color: #00ffc8; border: 1px solid rgba(0,255,200,0.2); }
        .log-team-B { background: rgba(255,50,80,0.08); color: #ff3250; border: 1px solid rgba(255,50,80,0.2); }

        .log-time { font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 1px; flex-shrink: 0; }

        /* Back & Voice Buttons */
        .back-btn {
          position: absolute; top: 20px; left: 20px;
          background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); cursor: pointer; padding: 8px 16px;
          font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; pointer-events: auto; transition: all 0.2s;
        }

        .back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

        .voice-toggle-btn {
          position: absolute; top: 20px; right: 20px;
          background: rgba(255,50,80,0.15); border: 1px solid rgba(255,50,80,0.4);
          color: #ff3250; cursor: pointer; padding: 8px 16px;
          font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; pointer-events: auto; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }

        .voice-toggle-btn.active { background: #ff3250; color: #fff; box-shadow: 0 0 20px rgba(255,50,80,0.4); }

        .voice-panel {
          position: absolute; top: 0; right: 0; bottom: 0; width: 360px;
          background: rgba(8,10,15,0.97); border-left: 1px solid rgba(255,50,80,0.2);
          backdrop-filter: blur(20px); pointer-events: auto; overflow-y: auto;
          animation: slideLeft 0.3s ease; z-index: 20;
        }

        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .voice-panel-header {
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
        }

        .voice-panel-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; color: #fff; }
        .voice-panel-close { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 18px; line-height: 1; padding: 0; transition: color 0.2s; }
        .voice-panel-close:hover { color: #fff; }

        /* Winner */
        .winner-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.85);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          pointer-events: auto; animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .winner-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 80px; letter-spacing: 8px; color: #00ffc8;
          text-shadow: 0 0 60px rgba(0,255,200,0.6); line-height: 1;
          animation: pulse 1s ease infinite; text-align: center; padding: 0 16px;
        }

        @keyframes pulse { 0%, 100% { text-shadow: 0 0 60px rgba(0,255,200,0.6); } 50% { text-shadow: 0 0 100px rgba(0,255,200,0.9); } }

        .winner-sub {
          font-family: 'Rajdhani', sans-serif; font-size: 18px; letter-spacing: 6px;
          color: rgba(255,255,255,0.5); text-transform: uppercase; margin: 16px 0 40px;
        }

        .new-match-btn {
          padding: 16px 48px; background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 4px; color: #000;
          transition: all 0.3s;
        }

        .new-match-btn:hover { background: #fff; box-shadow: 0 0 50px rgba(0,255,200,0.5); }
      `}</style>

      {/* Back Button */}
      {onBack && <button className="back-btn" onClick={onBack}>← Dashboard</button>}

      {/* Voice Scorer Toggle */}
      <button
        className={`voice-toggle-btn ${showVoice ? "active" : ""}`}
        onClick={() => setShowVoice(v => !v)}
      >
        🎙 {showVoice ? "Hide Voice" : "Voice Scorer"}
      </button>

      {/* Top Scoreboard */}
      <div className="overlay-top">
        <div className="scoreboard">
          {/* Team A */}
          <div className={`team-score ${playerA > playerB ? "active" : ""}`}>
            <div className="team-title">Team A</div>
            <div className="team-name">{matchData?.teamA || "Team A"}</div>
            <div className="team-players">
              {matchData?.players?.A1 || "Player 1"}
              {matchData?.players?.A2 ? ` / ${matchData.players.A2}` : ""}
            </div>
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
            <button className="reset-btn" onClick={() => { reset(); setPointLog([]); }}>Reset</button>
          </div>

          {/* Team B */}
          <div className={`team-score ${playerB > playerA ? "active" : ""}`}>
            <div className="team-title">Team B</div>
            <div className="team-name">{matchData?.teamB || "Team B"}</div>
            <div className="team-players">
              {matchData?.players?.B1 || "Player 1"}
              {matchData?.players?.B2 ? ` / ${matchData.players.B2}` : ""}
            </div>
            <div className="score-num">{playerB}</div>
            <button className="score-btn" onClick={() => addScore("B", scoreB)}>+ POINT</button>
          </div>
        </div>
      </div>

      {/* Last Point Flash */}
      {lastPoint && (
        <div className="last-point-flash">
          <div className="flash-icon">{lastPoint.icon}</div>
          <div className="flash-player">{lastPoint.playerName}</div>
          <div className="flash-how">{lastPoint.how}</div>
          <div className="flash-team">{lastPoint.teamName}</div>
        </div>
      )}

      {/* Point Log */}
      <div className="point-log-panel">
        <div className="log-header">
          <div className="log-label">📋 Point Log</div>
          <div className="log-line" />
        </div>
        {pointLog.slice(0, 5).map((entry, i) => (
          <div className="log-item" key={entry.id}>
            <div className="log-icon">{entry.icon}</div>
            <div className="log-info">
              <div className="log-player">{entry.playerName}</div>
              {entry.how && <div className="log-how">{entry.how}</div>}
            </div>
            <div className={`log-team-badge log-team-${entry.team}`}>{entry.teamName}</div>
            <div className="log-time">{entry.time}</div>
          </div>
        ))}
      </div>

      {/* Voice Scorer Panel */}
      {showVoice && (
        <div className="voice-panel">
          <div className="voice-panel-header">
            <div className="voice-panel-title">🎙 Voice Scorer</div>
            <button className="voice-panel-close" onClick={() => setShowVoice(false)}>✕</button>
          </div>
          <VoiceScorer
            matchData={matchData}
            onScoreA={handleVoiceScoreA}
            onScoreB={handleVoiceScoreB}
            onReset={handleVoiceReset}
            onCommentary={handleVoiceCommentary}
            onNextGame={handleNextGame}
          />
        </div>
      )}

      {/* Winner */}
      {showWinner && (
        <div className="winner-overlay">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div className="winner-title">{winner}</div>
          <div className="winner-sub">Match Complete · GG WP</div>
          <button className="new-match-btn" onClick={() => { reset(); setShowWinner(false); setPointLog([]); onBack?.(); }}>
            New Match
          </button>
        </div>
      )}
    </div>
  );
}

export default OverlayUI;