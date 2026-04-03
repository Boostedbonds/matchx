import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";

// Simulated live matches
const LIVE_MATCHES = [
  {
    id: 1,
    teamA: "Eagles FC",
    teamB: "Smash FC",
    playerA1: "Rahul Sharma",
    playerA2: "",
    playerB1: "Arjun Mehta",
    playerB2: "",
    type: "Singles",
    scoreA: 14,
    scoreB: 11,
    game: 1,
    duration: "18:32",
    viewers: 47,
    host: "RS",
  },
  {
    id: 2,
    teamA: "Rally Club",
    teamB: "Court Kings",
    playerA1: "Priya Kapoor",
    playerA2: "Sneha Rao",
    playerB1: "Dev Patel",
    playerB2: "Karan Tiwari",
    type: "Doubles",
    scoreA: 19,
    scoreB: 21,
    game: 2,
    duration: "34:15",
    viewers: 83,
    host: "PK",
  },
];

const COMMENTARY_POOL = [
  "Powerful cross-court smash from the left side!",
  "Brilliant net drop — caught the opponent completely off guard!",
  "What a rally! 23 shots exchanged before the point was won.",
  "Service ace — clean, flat, and unreturnable.",
  "Incredible jump smash from the back court!",
  "Net fault on the serve — pressure mounting.",
  "Exceptional backhand flick return down the line!",
  "Both players showing tremendous court coverage.",
  "Deceptive drop shot draws the opponent to the net.",
  "Lightning-fast reflex at the net — point saved!",
  "High clear sets up the perfect attack opportunity.",
  "Drive exchange at the net — who will blink first?",
  "Superb body smash forces a weak return!",
  "The crowd is on its feet — what a point!",
  "Perfect placement — just kissing the line!",
];

const MATCH_STATS_DATA = {
  smashes: [12, 9],
  netPoints: [8, 11],
  clearShots: [23, 19],
  serviceErrors: [2, 4],
  rallyAvg: ["14.2", "12.8"],
  winRate: [67, 55],
};

function SpectatorView({ user, onNav, onLogout }) {
  const [selectedMatch, setSelectedMatch] = useState(LIVE_MATCHES[0]);
  const [scores, setScores] = useState({ a: selectedMatch.scoreA, b: selectedMatch.scoreB });
  const [commentary, setCommentary] = useState([
    { text: "Match underway — both players warming up well.", time: "18:32", highlight: false },
    { text: "Rahul opens with a powerful service!", time: "18:28", highlight: false },
    { text: "SMASH! Incredible power from the back court!", time: "18:24", highlight: true },
    { text: "Net fault — point to Arjun Mehta.", time: "18:19", highlight: false },
    { text: "Match started — Eagles FC vs Smash FC", time: "18:00", highlight: false },
  ]);
  const [viewers, setViewers] = useState(selectedMatch.viewers);
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const commEndRef = useRef(null);

  // Simulate live score updates
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.3) {
        const winner = Math.random() > 0.5 ? "a" : "b";
        setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
        const msg = COMMENTARY_POOL[Math.floor(Math.random() * COMMENTARY_POOL.length)];
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        setCommentary(prev => [
          { text: msg, time: timeStr, highlight: Math.random() > 0.7 },
          ...prev,
        ].slice(0, 20));
      }
      // Simulate viewer count fluctuation
      setViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [elapsed]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Start camera stream
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const leading = scores.a > scores.b ? "a" : scores.b > scores.a ? "b" : null;

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .main {
          margin-left: 220px;
          flex: 1;
          min-height: 100vh;
          overflow-y: auto;
          padding: 32px;
          width: calc(100% - 220px);
        }

        @media (max-width: 768px) {
          .main {
            margin-left: 0;
            padding: 16px;
            width: 100%;
          }
        }

        /* Header */
        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px;
        }

        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 44px; letter-spacing: 4px; color: #fff;
        }

        @media (max-width: 768px) {
          .page-title { font-size: 28px; letter-spacing: 2px; }
        }

        .live-indicator {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,50,80,0.12);
          border: 1px solid rgba(255,50,80,0.35);
          padding: 8px 18px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 3px;
          color: #ff3250; text-transform: uppercase;
        }

        .live-dot {
          width: 8px; height: 8px; background: #ff3250;
          border-radius: 50%; animation: blink 1s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        /* Match selector */
        .match-selector {
          display: flex; gap: 12px; margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .match-selector { flex-direction: column; }
        }

        .match-tab {
          padding: 12px 20px;
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; transition: all 0.2s;
          flex: 1;
        }

        .match-tab.active {
          border-color: rgba(255,50,80,0.4);
          background: rgba(255,50,80,0.06);
        }

        .match-tab:hover:not(.active) { border-color: rgba(255,255,255,0.15); }

        .mt-teams {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 2px; color: #fff; margin-bottom: 4px;
        }

        .mt-meta {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        .mt-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px; color: #ff3250; letter-spacing: 2px; margin-top: 4px;
        }

        /* Main grid */
        .spectator-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .spectator-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Scoreboard */
        .scoreboard-card {
          background: linear-gradient(135deg, #0d1520, #080a0f);
          border: 1px solid rgba(0,255,200,0.12);
          padding: 32px;
          position: relative; overflow: hidden;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .scoreboard-card { padding: 20px; }
        }

        .scoreboard-card::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(0,255,200,0.05), transparent 60%);
          pointer-events: none;
        }

        .sb-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 28px;
        }

        .sb-meta {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .sb-timer {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: #00ffc8; letter-spacing: 3px;
        }

        .sb-viewers {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
        }

        .eye-icon { font-size: 14px; }

        /* Main score display */
        .score-display {
          display: grid; grid-template-columns: 1fr 80px 1fr;
          align-items: center; gap: 0;
        }

        .team-block { text-align: center; }

        .team-block.leading .score-big {
          color: #00ffc8;
          text-shadow: 0 0 40px rgba(0,255,200,0.5);
        }

        .team-name-big {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 3px; color: #fff; margin-bottom: 4px;
        }

        @media (max-width: 480px) {
          .team-name-big { font-size: 18px; letter-spacing: 1px; }
        }

        .team-players-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.25);
          letter-spacing: 1px; margin-bottom: 20px;
        }

        .score-big {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 100px; line-height: 1; color: rgba(255,255,255,0.5);
          transition: color 0.4s, text-shadow 0.4s;
          animation: scoreUpdate 0.3s ease;
        }

        @media (max-width: 480px) {
          .score-big { font-size: 64px; }
        }

        @keyframes scoreUpdate {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .game-indicator { text-align: center; }

        .game-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; letter-spacing: 2px; color: rgba(255,255,255,0.2);
          margin-bottom: 4px;
        }

        .vs-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; color: rgba(255,255,255,0.1); letter-spacing: 4px;
        }

        /* Game history dots */
        .game-history {
          display: flex; justify-content: center; gap: 8px;
          margin-top: 24px; padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .game-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }

        .game-dot.won { background: #00ffc8; box-shadow: 0 0 8px #00ffc8; }
        .game-dot.lost { background: #ff3250; }
        .game-dot.current { background: rgba(255,255,255,0.3); animation: blink 1.5s infinite; }

        /* Camera / Stream */
        .stream-card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden; margin-bottom: 20px;
          position: relative;
        }

        .stream-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
        }

        .stream-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        .stream-badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          padding: 3px 10px; text-transform: uppercase;
        }

        .stream-badge.live { color: #ff3250; background: rgba(255,50,80,0.1); border: 1px solid rgba(255,50,80,0.25); animation: blink 1s infinite; }
        .stream-badge.offline { color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }

        .stream-body {
          position: relative;
          background: #000;
          aspect-ratio: 16/9;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        .stream-body video {
          width: 100%; height: 100%; object-fit: cover;
        }

        .stream-placeholder {
          text-align: center;
          font-family: 'Rajdhani', sans-serif;
        }

        .stream-placeholder-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
        .stream-placeholder-text { font-size: 12px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; }

        /* Overlay on video */
        .video-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%);
        }

        .video-score-overlay {
          position: absolute; bottom: 12px; left: 0; right: 0;
          display: flex; justify-content: center; pointer-events: none;
        }

        .vso-inner {
          background: rgba(8,10,15,0.85);
          border: 1px solid rgba(0,255,200,0.2);
          padding: 8px 20px;
          display: flex; align-items: center; gap: 16px;
          backdrop-filter: blur(10px);
        }

        .vso-team { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 2px; color: rgba(255,255,255,0.6); }
        .vso-score { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #00ffc8; letter-spacing: 2px; }
        .vso-sep { font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: rgba(255,255,255,0.2); }

        .stream-controls {
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; gap: 10px;
        }

        .stream-btn {
          flex: 1; padding: 11px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px; letter-spacing: 3px;
          cursor: pointer; border: 1px solid; transition: all 0.2s;
        }

        .stream-btn.start { background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.25); color: #00ffc8; }
        .stream-btn.start:hover { background: #00ffc8; color: #000; }
        .stream-btn.stop { background: rgba(255,50,80,0.08); border-color: rgba(255,50,80,0.25); color: #ff3250; }
        .stream-btn.stop:hover { background: rgba(255,50,80,0.2); }

        /* Stats */
        .stats-card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 20px; margin-bottom: 20px;
        }

        .card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 18px; padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .stat-bar-row {
          margin-bottom: 14px;
        }

        .stat-bar-header {
          display: flex; justify-content: space-between;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .stat-bar-label { color: rgba(255,255,255,0.35); text-transform: uppercase; font-size: 10px; letter-spacing: 2px; }
        .stat-bar-a { color: #00ffc8; }
        .stat-bar-b { color: #ff3250; }

        .stat-bar-track {
          height: 6px; background: rgba(255,255,255,0.06);
          border-radius: 3px; overflow: hidden;
          display: flex;
        }

        .stat-bar-fill-a {
          height: 100%; border-radius: 3px 0 0 3px;
          background: linear-gradient(90deg, #00ffc8, rgba(0,255,200,0.5));
          transition: width 1s ease;
        }

        .stat-bar-fill-b {
          height: 100%; border-radius: 0 3px 3px 0;
          background: linear-gradient(270deg, #ff3250, rgba(255,50,80,0.5));
          transition: width 1s ease;
        }

        /* Commentary */
        .commentary-card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .comm-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
        }

        .comm-feed {
          max-height: 320px; overflow-y: auto;
          padding: 12px 0;
        }

        .comm-feed::-webkit-scrollbar { width: 4px; }
        .comm-feed::-webkit-scrollbar-track { background: transparent; }
        .comm-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .comm-item {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          animation: slideIn 0.3s ease;
          transition: background 0.2s;
        }

        .comm-item:hover { background: rgba(255,255,255,0.02); }

        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .comm-item.highlight { background: rgba(0,255,200,0.04); border-left: 2px solid #00ffc8; }

        .comm-time {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; color: rgba(255,255,255,0.2); letter-spacing: 1px;
          flex-shrink: 0; width: 44px;
        }

        .comm-text {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 0.3px;
          color: rgba(255,255,255,0.55); line-height: 1.4; flex: 1;
        }

        .comm-item:first-child .comm-text { color: rgba(255,255,255,0.9); }
        .comm-item.highlight .comm-text { color: #00ffc8; }

        .comm-mic { font-size: 12px; flex-shrink: 0; margin-top: 2px; }

        /* Viewer count */
        .viewer-pulse {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 2px; color: #ff3250;
        }

        .camera-error {
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          color: #ff3250; letter-spacing: 1px; padding: 8px 20px;
          background: rgba(255,50,80,0.06); border-top: 1px solid rgba(255,50,80,0.15);
        }
      `}</style>

      <Sidebar active="spectator" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        {/* Header */}
        <div className="page-header">
          <div className="page-title">📡 Watch Live</div>
          <div className="live-indicator">
            <div className="live-dot" />
            {LIVE_MATCHES.length} Matches Live
          </div>
        </div>

        {/* Match Selector */}
        <div className="match-selector">
          {LIVE_MATCHES.map(m => (
            <div
              key={m.id}
              className={`match-tab ${selectedMatch.id === m.id ? "active" : ""}`}
              onClick={() => { setSelectedMatch(m); setScores({ a: m.scoreA, b: m.scoreB }); }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="mt-teams">{m.teamA} vs {m.teamB}</div>
                  <div className="mt-meta">🏸 {m.type} · Game {m.game} · {m.duration}</div>
                  <div className="mt-score">{m.scoreA} — {m.scoreB}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, letterSpacing: 2, color: "#ff3250", fontWeight: 700 }}>● LIVE</div>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>👁 {m.viewers}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="spectator-grid">

          {/* Left Column */}
          <div>
            {/* Scoreboard */}
            <div className="scoreboard-card">
              <div className="sb-header">
                <div className="sb-meta">🏸 {selectedMatch.type} · Game {selectedMatch.game}</div>
                <div className="sb-timer">{formatTime(elapsed)}</div>
                <div className="sb-viewers">
                  <span className="eye-icon">👁</span>
                  <span style={{ color: "#ff3250" }}>{Math.max(1, viewers)}</span> watching
                </div>
              </div>

              <div className="score-display">
                <div className={`team-block ${leading === "a" ? "leading" : ""}`}>
                  <div className="team-name-big">{selectedMatch.teamA}</div>
                  <div className="team-players-sub">{selectedMatch.playerA1}{selectedMatch.playerA2 ? ` / ${selectedMatch.playerA2}` : ""}</div>
                  <div className="score-big">{scores.a}</div>
                </div>

                <div className="game-indicator">
                  <div className="game-num">GAME<br />{selectedMatch.game}</div>
                  <div className="vs-text">:</div>
                </div>

                <div className={`team-block ${leading === "b" ? "leading" : ""}`}>
                  <div className="team-name-big">{selectedMatch.teamB}</div>
                  <div className="team-players-sub">{selectedMatch.playerB1}{selectedMatch.playerB2 ? ` / ${selectedMatch.playerB2}` : ""}</div>
                  <div className="score-big">{scores.b}</div>
                </div>
              </div>

              <div className="game-history">
                {[1, 2, 3].map(g => (
                  <div key={g}>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", textAlign: "center", marginBottom: 4 }}>G{g}</div>
                    <div className={`game-dot ${g < selectedMatch.game ? "won" : g === selectedMatch.game ? "current" : ""}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Camera Stream */}
            <div className="stream-card">
              <div className="stream-header">
                <div className="stream-title">📷 Live Camera Feed</div>
                <div className={`stream-badge ${streaming ? "live" : "offline"}`}>
                  {streaming ? "● Live" : "● Waiting"}
                </div>
              </div>

              <div className="stream-body">
                {streaming ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div className="video-overlay" />
                    <div className="video-score-overlay">
                      <div className="vso-inner">
                        <span className="vso-team">{selectedMatch.teamA}</span>
                        <span className="vso-score">{scores.a}</span>
                        <span className="vso-sep">:</span>
                        <span className="vso-score">{scores.b}</span>
                        <span className="vso-team">{selectedMatch.teamB}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="stream-placeholder">
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📡</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                      Waiting for Scorer
                    </div>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                      Stream will appear when scorer starts broadcasting
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb800", animation: "blink 1.5s infinite" }} />
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "#ffb800", letterSpacing: 2, fontWeight: 700 }}>
                        STANDBY
                      </div>
                    </div>
                    <div style={{ marginTop: 20, padding: "10px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 6 }}>
                        💡 How to get stream
                      </div>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                        Ask the scorer to tap <strong style={{ color: "rgba(255,255,255,0.5)" }}>📷 Camera</strong> in the match screen to start broadcasting.
                        <br />Full WebRTC streaming requires Firebase setup.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Live Stats */}
            <div className="stats-card">
              <div className="card-title">
                Match Stats
                <span style={{ float: "right", color: "#00ffc8" }}>{selectedMatch.teamA} vs {selectedMatch.teamB}</span>
              </div>

              {[
                { label: "Smashes", a: MATCH_STATS_DATA.smashes[0], b: MATCH_STATS_DATA.smashes[1] },
                { label: "Net Points", a: MATCH_STATS_DATA.netPoints[0], b: MATCH_STATS_DATA.netPoints[1] },
                { label: "Clear Shots", a: MATCH_STATS_DATA.clearShots[0], b: MATCH_STATS_DATA.clearShots[1] },
                { label: "Errors", a: MATCH_STATS_DATA.serviceErrors[0], b: MATCH_STATS_DATA.serviceErrors[1] },
              ].map((s, i) => {
                const total = s.a + s.b || 1;
                return (
                  <div className="stat-bar-row" key={i}>
                    <div className="stat-bar-header">
                      <span className="stat-bar-a">{s.a}</span>
                      <span className="stat-bar-label">{s.label}</span>
                      <span className="stat-bar-b">{s.b}</span>
                    </div>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill-a" style={{ width: `${(s.a / total) * 100}%` }} />
                      <div className="stat-bar-fill-b" style={{ width: `${(s.b / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                {[
                  { label: "Avg Rally", a: MATCH_STATS_DATA.rallyAvg[0], b: MATCH_STATS_DATA.rallyAvg[1] },
                  { label: "Win Rate", a: `${MATCH_STATS_DATA.winRate[0]}%`, b: `${MATCH_STATS_DATA.winRate[1]}%` },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#00ffc8" }}>{s.a}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "rgba(255,255,255,0.15)" }}>·</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#ff3250" }}>{s.b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commentary */}
            <div className="commentary-card">
              <div className="comm-header">
                <div className="card-title" style={{ margin: 0, padding: 0, border: "none" }}>🎙 Live Commentary</div>
                <div className="viewer-pulse">
                  <div className="live-dot" />
                  Auto
                </div>
              </div>
              <div className="comm-feed">
                {commentary.map((c, i) => (
                  <div key={i} className={`comm-item ${c.highlight ? "highlight" : ""}`}>
                    <div className="comm-time">{c.time}</div>
                    <div className="comm-mic">{c.highlight ? "🔥" : "🎙"}</div>
                    <div className="comm-text">{c.text}</div>
                  </div>
                ))}
                <div ref={commEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpectatorView;