import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import Sidebar from "../components/Sidebar";

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

function SpectatorView({ user, onNav, onLogout }) {
  const [liveMatch, setLiveMatch] = useState(null);
  const [commentary, setCommentary] = useState([]);
  const [viewers, setViewers] = useState(12);
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const prevScoreRef = useRef({ playerA: 0, playerB: 0 });

  // Subscribe to Supabase live match in real-time
  useEffect(() => {
    // Initial fetch
    const fetchLiveMatch = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live")
        .single();
      if (!error && data) {
        setLiveMatch(data);
        prevScoreRef.current = { playerA: data.playerA ?? 0, playerB: data.playerB ?? 0 };
      }
    };
    fetchLiveMatch();

    // Realtime subscription
    const channel = supabase
      .channel("live-match-spectator")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: "status=eq.live" },
        (payload) => {
          const data = payload.new;
          if (!data) return;
          setLiveMatch(data);

          const prev = prevScoreRef.current;
          const scoredA = (data.playerA ?? 0) > prev.playerA;
          const scoredB = (data.playerB ?? 0) > prev.playerB;
          if (scoredA || scoredB) {
            const msg = COMMENTARY_POOL[Math.floor(Math.random() * COMMENTARY_POOL.length)];
            const now = new Date();
            const timeStr = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
            const team = scoredA ? (data.teamAName || "Team A") : (data.teamBName || "Team B");
            setCommentary(prev => [
              { text: `${team} scores! ${msg}`, time: timeStr, highlight: Math.random() > 0.6 },
              ...prev,
            ].slice(0, 20));
            setViewers(v => v + Math.floor(Math.random() * 2));
            prevScoreRef.current = { playerA: data.playerA ?? 0, playerB: data.playerB ?? 0 };
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
      setCameraError(false);
    } catch { setCameraError(true); }
  };

  const stopStream = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const scoreA  = liveMatch?.playerA ?? 0;
  const scoreB  = liveMatch?.playerB ?? 0;
  const teamA   = liveMatch?.teamAName || "Team A";
  const teamB   = liveMatch?.teamBName || "Team B";
  const leading = scoreA > scoreB ? "a" : scoreB > scoreA ? "b" : null;
  const isDeuce = scoreA >= 20 && scoreB >= 20 && scoreA === scoreB;

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sidebar-wrapper { flex-shrink: 0; }
        .main { margin-left: 220px; flex: 1; width: calc(100% - 220px); min-height: 100vh; overflow-y: auto; padding: 32px; }
        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
          .main { margin-left: 0 !important; width: 100% !important; padding: 16px !important; }
          .spectator-grid { grid-template-columns: 1fr !important; }
          .score-big { font-size: 64px !important; }
          .team-name-big { font-size: 20px !important; }
          .page-title { font-size: 30px !important; }
          .scoreboard-card { padding: 20px !important; }
          .score-display { grid-template-columns: 1fr 60px 1fr !important; }
        }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 44px; letter-spacing: 4px; color: #fff; }
        .live-indicator { display: flex; align-items: center; gap: 8px; background: rgba(255,50,80,0.12); border: 1px solid rgba(255,50,80,0.35); padding: 8px 18px; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 3px; color: #ff3250; text-transform: uppercase; }
        .live-dot { width: 8px; height: 8px; background: #ff3250; border-radius: 50%; animation: blink 1s infinite; flex-shrink: 0; }
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .no-match { text-align: center; padding: 80px 20px; font-family: 'Rajdhani', sans-serif; }
        .no-match-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
        .no-match-text { font-size: 14px; letter-spacing: 3px; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .spectator-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
        .scoreboard-card { background: linear-gradient(135deg, #0d1520, #080a0f); border: 1px solid rgba(0,255,200,0.12); padding: 32px; position: relative; overflow: hidden; margin-bottom: 20px; }
        .scoreboard-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(0,255,200,0.05), transparent 60%); pointer-events: none; }
        .sb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 8px; }
        .sb-meta { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .sb-timer { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #00ffc8; letter-spacing: 3px; }
        .sb-viewers { display: flex; align-items: center; gap: 6px; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.4); }
        .score-display { display: grid; grid-template-columns: 1fr 80px 1fr; align-items: center; }
        .team-block { text-align: center; min-width: 0; }
        .team-block.leading .score-big { color: #00ffc8; text-shadow: 0 0 40px rgba(0,255,200,0.5); }
        .team-name-big { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 3px; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .score-big { font-family: 'Bebas Neue', sans-serif; font-size: 100px; line-height: 1; color: rgba(255,255,255,0.5); transition: all 0.4s; }
        .game-indicator { text-align: center; }
        .vs-text { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: rgba(255,255,255,0.1); letter-spacing: 4px; }
        .winner-banner { margin-top: 20px; padding: 14px; background: rgba(0,255,200,0.08); border: 1px solid rgba(0,255,200,0.3); text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 4px; color: #00ffc8; animation: blink 1s infinite; }
        .stream-card { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 20px; }
        .stream-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .stream-title { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .stream-badge { font-family: 'Rajdhani', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; padding: 3px 10px; text-transform: uppercase; }
        .stream-badge.live { color: #ff3250; background: rgba(255,50,80,0.1); border: 1px solid rgba(255,50,80,0.25); animation: blink 1s infinite; }
        .stream-badge.offline { color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
        .stream-body { position: relative; background: #000; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .stream-body video { width: 100%; height: 100%; object-fit: cover; }
        .stream-placeholder { text-align: center; font-family: 'Rajdhani', sans-serif; }
        .stream-placeholder-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
        .stream-placeholder-text { font-size: 12px; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; }
        .video-overlay { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 40%); }
        .video-score-overlay { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; }
        .vso-inner { background: rgba(8,10,15,0.85); border: 1px solid rgba(0,255,200,0.2); padding: 8px 20px; display: flex; align-items: center; gap: 16px; backdrop-filter: blur(10px); }
        .vso-team { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 2px; color: rgba(255,255,255,0.6); }
        .vso-score { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #00ffc8; letter-spacing: 2px; }
        .vso-sep { font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: rgba(255,255,255,0.2); }
        .stream-controls { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px; }
        .stream-btn { flex: 1; padding: 11px; font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 3px; cursor: pointer; border: 1px solid; transition: all 0.2s; }
        .stream-btn.start { background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.25); color: #00ffc8; }
        .stream-btn.start:hover { background: #00ffc8; color: #000; }
        .stream-btn.stop { background: rgba(255,50,80,0.08); border-color: rgba(255,50,80,0.25); color: #ff3250; }
        .camera-error { font-family: 'Rajdhani', sans-serif; font-size: 12px; color: #ff3250; letter-spacing: 1px; padding: 8px 20px; background: rgba(255,50,80,0.06); border-top: 1px solid rgba(255,50,80,0.15); }
        .score-card { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); padding: 20px; margin-bottom: 20px; }
        .card-title { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .stat-row-big { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .stat-row-big:last-child { border-bottom: none; }
        .stat-label { font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.3); text-transform: uppercase; }
        .commentary-card { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
        .comm-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .comm-feed { max-height: 360px; overflow-y: auto; padding: 12px 0; }
        .comm-feed::-webkit-scrollbar { width: 4px; }
        .comm-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .comm-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .comm-item.highlight { background: rgba(0,255,200,0.04); border-left: 2px solid #00ffc8; }
        .comm-time { font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: rgba(255,255,255,0.2); letter-spacing: 1px; flex-shrink: 0; width: 44px; }
        .comm-text { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.55); line-height: 1.4; flex: 1; }
        .comm-item:first-child .comm-text { color: rgba(255,255,255,0.9); }
        .comm-item.highlight .comm-text { color: #00ffc8; }
        .comm-mic { font-size: 12px; flex-shrink: 0; margin-top: 2px; }
        .comm-empty { padding: 24px 20px; font-family: 'Rajdhani', sans-serif; font-size: 12px; color: rgba(255,255,255,0.2); letter-spacing: 2px; text-transform: uppercase; text-align: center; }
        .viewer-pulse { display: inline-flex; align-items: center; gap: 6px; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #ff3250; }
      `}</style>

      <div className="sidebar-wrapper">
        <Sidebar active="spectator" user={user} onNav={onNav} onLogout={onLogout} />
      </div>

      <div className="main">
        <div className="page-header">
          <div className="page-title">📡 Watch Live</div>
          <div className="live-indicator">
            <div className="live-dot" />
            {liveMatch ? "1 Match Live" : "No Matches"}
          </div>
        </div>

        {!liveMatch ? (
          <div className="no-match">
            <div className="no-match-icon">🏸</div>
            <div className="no-match-text">No live match in progress</div>
            <div style={{ marginTop: 8, fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.15)", letterSpacing: 1 }}>
              Start a match from the scorer device — it will appear here instantly
            </div>
          </div>
        ) : (
          <div className="spectator-grid">

            <div>
              <div className="scoreboard-card">
                <div className="sb-header">
                  <div className="sb-meta">🏸 Live Match · {liveMatch.matchType || "Singles"}</div>
                  <div className="sb-timer">{formatTime(elapsed)}</div>
                  <div className="sb-viewers">
                    <span>👁</span>
                    <span style={{ color: "#ff3250" }}>{Math.max(1, viewers)}</span>&nbsp;watching
                  </div>
                </div>

                <div className="score-display">
                  <div className={`team-block ${leading === "a" ? "leading" : ""}`}>
                    <div className="team-name-big">{teamA}</div>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>&nbsp;</div>
                    <div className="score-big">{scoreA}</div>
                  </div>
                  <div className="game-indicator">
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>LIVE</div>
                    <div className="vs-text">:</div>
                  </div>
                  <div className={`team-block ${leading === "b" ? "leading" : ""}`}>
                    <div className="team-name-big">{teamB}</div>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>&nbsp;</div>
                    <div className="score-big">{scoreB}</div>
                  </div>
                </div>

                {isDeuce && !liveMatch.winner && (
                  <div style={{ marginTop: 16, textAlign: "center", fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 4, color: "#ffb800", padding: "8px", background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)" }}>
                    ⚡ DEUCE!
                  </div>
                )}

                {liveMatch.winner && (
                  <div className="winner-banner">🏆 {liveMatch.winner}</div>
                )}
              </div>

              <div className="stream-card">
                <div className="stream-header">
                  <div className="stream-title">📷 Live Camera Feed</div>
                  <div className={`stream-badge ${streaming ? "live" : "offline"}`}>
                    {streaming ? "● Streaming" : "Offline"}
                  </div>
                </div>
                <div className="stream-body">
                  {streaming ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div className="video-overlay" />
                      <div className="video-score-overlay">
                        <div className="vso-inner">
                          <span className="vso-team">{teamA}</span>
                          <span className="vso-score">{scoreA}</span>
                          <span className="vso-sep">:</span>
                          <span className="vso-score">{scoreB}</span>
                          <span className="vso-team">{teamB}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="stream-placeholder">
                      <div className="stream-placeholder-icon">📷</div>
                      <div className="stream-placeholder-text">Camera not active</div>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: 1, marginTop: 6 }}>
                        Start stream to broadcast this match
                      </div>
                    </div>
                  )}
                </div>
                {cameraError && (
                  <div className="camera-error">⚠️ Camera access denied — please allow camera permissions</div>
                )}
                <div className="stream-controls">
                  {!streaming
                    ? <button className="stream-btn start" onClick={startStream}>📡 Start Streaming</button>
                    : <button className="stream-btn stop" onClick={stopStream}>⏹ Stop Stream</button>
                  }
                </div>
              </div>
            </div>

            <div>
              <div className="score-card">
                <div className="card-title">
                  Live Score
                  <span style={{ float: "right", color: "#ff3250" }}>● LIVE</span>
                </div>
                <div className="stat-row-big">
                  <div className="stat-label">Scores</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{teamA.substring(0,8).toUpperCase()}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#00ffc8" }}>{scoreA}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "rgba(255,255,255,0.15)", paddingBottom: 4 }}>:</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{teamB.substring(0,8).toUpperCase()}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#ff3250" }}>{scoreB}</div>
                    </div>
                  </div>
                </div>
                <div className="stat-row-big">
                  <div className="stat-label">Status</div>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: liveMatch.winner ? "#00ffc8" : isDeuce ? "#ffb800" : "#00ff64" }}>
                    {liveMatch.winner ? "🏆 Complete" : isDeuce ? "⚡ Deuce" : "🟢 In Progress"}
                  </div>
                </div>
                <div className="stat-row-big">
                  <div className="stat-label">Total Points</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#fff" }}>{scoreA + scoreB}</div>
                </div>
                <div className="stat-row-big">
                  <div className="stat-label">Leading</div>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#ffb800" }}>
                    {leading === "a" ? teamA : leading === "b" ? teamB : "—"}
                  </div>
                </div>
              </div>

              <div className="commentary-card">
                <div className="comm-header">
                  <div className="card-title" style={{ margin: 0, padding: 0, border: "none" }}>🎙 Live Commentary</div>
                  <div className="viewer-pulse"><div className="live-dot" />Live</div>
                </div>
                <div className="comm-feed">
                  {commentary.length === 0
                    ? <div className="comm-empty">Waiting for first point...</div>
                    : commentary.map((c, i) => (
                      <div key={i} className={`comm-item ${c.highlight ? "highlight" : ""}`}>
                        <div className="comm-time">{c.time}</div>
                        <div className="comm-mic">{c.highlight ? "🔥" : "🎙"}</div>
                        <div className="comm-text">{c.text}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default SpectatorView;