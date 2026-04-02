import { useState, useEffect } from "react";
import useMatchStore from "../store/matchStore";

const SHOT_TYPES = [
  { label: "Smash",          icon: "💥" },
  { label: "Drop",           icon: "🪶" },
  { label: "Net Shot",       icon: "🕸️" },
  { label: "Clear",          icon: "🏹" },
  { label: "Drive",          icon: "⚡" },
  { label: "Lift",           icon: "☁️" },
  { label: "Push",           icon: "👊" },
  { label: "Flick",          icon: "🪄" },
  { label: "Opponent Error", icon: "❌" },
];

function OverlayUI({ matchData, onBack, onMatchComplete }) {
  const { playerA, playerB, winner, scoreA, scoreB, reset, undo } = useMatchStore();

  const [selectedShot, setSelectedShot] = useState(null);
  const [scoringTeam,  setScoringTeam]  = useState(null);
  const [pointLog,     setPointLog]     = useState([]);
  const [lastPoint,    setLastPoint]    = useState(null);
  const [game,         setGame]         = useState(1);
  const [showWinner,   setShowWinner]   = useState(false);
  const [showCamera,   setShowCamera]   = useState(false);
  const [undoStack,    setUndoStack]    = useState([]);

  useEffect(() => { if (winner) setShowWinner(true); }, [winner]);

  const getPlayers = (team) => {
    const p = matchData?.players || {};
    return team === "A"
      ? [p.A1, p.A2].filter(Boolean)
      : [p.B1, p.B2].filter(Boolean);
  };

  const commitPoint = (team, playerName) => {
    // Save current scores to undo stack BEFORE scoring
    setUndoStack(prev => [...prev, { playerA, playerB }]);

    const fn = team === "A" ? scoreA : scoreB;
    fn();

    const sA = team === "A" ? playerA + 1 : playerA;
    const sB = team === "B" ? playerB + 1 : playerB;
    const shot     = selectedShot || { label: "—", icon: "🏸" };
    const teamName = matchData?.[`team${team}`] || `Team ${team}`;
    const templates = [
      `${playerName} earns the point with a ${shot.label.toLowerCase()}! ${sA}–${sB}.`,
      `Brilliant ${shot.label.toLowerCase()} by ${playerName}! ${teamName} at ${sA}–${sB}.`,
      `${playerName} wins the rally via ${shot.label.toLowerCase()}. Score: ${sA}–${sB}.`,
    ];
    const entry = {
      id: Date.now(), team, teamName, playerName,
      shot: shot.label, icon: shot.icon,
      scoreA: sA, scoreB: sB,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      commentary: templates[Math.floor(Math.random() * templates.length)],
    };
    setLastPoint(entry);
    setPointLog(prev => [entry, ...prev]);
    setSelectedShot(null);
    setScoringTeam(null);
    setTimeout(() => setLastPoint(null), 3000);
  };

  const handlePointBtn = (team) => {
    const players = getPlayers(team);
    if (players.length > 1) {
      setScoringTeam(team);
    } else {
      commitPoint(team, players[0] || (matchData?.[`team${team}`] || `Team ${team}`));
    }
  };

  const handleUndo = () => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    undo(prev.playerA, prev.playerB);   // writes back to Supabase
    setUndoStack(s => s.slice(0, -1));
    setPointLog(s => s.slice(1));
  };

  const handleReset = () => {
    reset();
    setPointLog([]); setUndoStack([]);
    setSelectedShot(null); setScoringTeam(null);
  };

  const handleNextGame = () => {
    reset();
    setGame(g => g + 1);
    setPointLog([]); setUndoStack([]);
  };

  const isDeuce   = playerA >= 20 && playerB >= 20 && playerA === playerB;
  const isMatchPt = !isDeuce && (
    (playerA >= 20 && playerA - playerB === 1) ||
    (playerB >= 20 && playerB - playerA === 1)
  );

  const teamAPlayers = getPlayers("A");
  const teamBPlayers = getPlayers("B");

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: "'Rajdhani', sans-serif", display: "flex", flexDirection: "column", background: "#080a0f", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .hdr { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#0d0f15; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
        .hdr-btn { background:none; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); cursor:pointer; padding:6px 12px; font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; transition:all 0.2s; }
        .hdr-btn:hover { color:#fff; border-color:rgba(255,255,255,0.3); }
        .hdr-btn.cam-on { background:rgba(0,255,200,0.1); border-color:rgba(0,255,200,0.3); color:#00ffc8; }
        .live-badge { display:flex; align-items:center; gap:6px; }
        .live-dot { width:7px; height:7px; background:#ff3250; border-radius:50%; animation:blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .live-txt { font-size:10px; letter-spacing:3px; color:#ff3250; font-weight:700; }
        .scoreboard { display:flex; align-items:stretch; background:#0d0f15; border-bottom:1px solid rgba(0,255,200,0.15); flex-shrink:0; }
        .team-col { flex:1; padding:12px 14px; text-align:center; position:relative; min-width:0; transition:background 0.3s; }
        .team-col.leading { background:rgba(0,255,200,0.04); }
        .team-col::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:#00ffc8; transform:scaleX(0); transition:transform 0.3s; }
        .team-col.leading::after { transform:scaleX(1); }
        .t-name { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:2px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t-players { font-size:11px; color:rgba(255,255,255,0.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
        .t-score { font-family:'Bebas Neue',sans-serif; font-size:60px; line-height:1; color:#00ffc8; text-shadow:0 0 20px rgba(0,255,200,0.3); }
        .mid-col { width:66px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; border-left:1px solid rgba(255,255,255,0.05); border-right:1px solid rgba(255,255,255,0.05); flex-shrink:0; }
        .mid-vs { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:3px; color:rgba(255,255,255,0.15); }
        .mid-game { font-size:9px; letter-spacing:2px; color:rgba(255,255,255,0.25); text-transform:uppercase; }
        .mid-gnum { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#fff; line-height:1; }
        .status-bar { text-align:center; padding:4px 8px; font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; flex-shrink:0; min-height:24px; }
        .s-deuce { background:rgba(255,184,0,0.15); color:#ffb800; }
        .s-mp { background:rgba(255,50,80,0.15); color:#ff3250; animation:blink 0.7s infinite; }
        .scorer-panel { flex:1; overflow-y:auto; padding:10px 12px; display:flex; flex-direction:column; gap:10px; }
        .sec-title { font-size:9px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.25); font-weight:700; margin-bottom:5px; }
        .shot-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
        .shot-btn { padding:9px 4px; text-align:center; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); cursor:pointer; transition:all 0.15s; }
        .shot-btn:hover { background:rgba(0,255,200,0.06); border-color:rgba(0,255,200,0.2); }
        .shot-btn.sel { background:rgba(0,255,200,0.12); border-color:#00ffc8; }
        .shot-icon { font-size:17px; margin-bottom:2px; }
        .shot-label { font-size:10px; font-weight:700; letter-spacing:1px; color:rgba(255,255,255,0.6); }
        .shot-btn.sel .shot-label { color:#00ffc8; }
        .sel-bar { padding:7px 10px; background:rgba(0,255,200,0.08); border:1px solid rgba(0,255,200,0.25); display:flex; align-items:center; gap:8px; }
        .sel-bar-txt { font-size:11px; font-weight:700; letter-spacing:2px; color:#00ffc8; text-transform:uppercase; flex:1; }
        .sel-bar-clr { background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer; font-size:13px; padding:0; }
        .point-btns { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .pt-btn { padding:14px 10px; text-align:center; cursor:pointer; border:1px solid rgba(255,255,255,0.08); transition:all 0.15s; background:rgba(255,255,255,0.02); }
        .pt-btn:active { transform:scale(0.97); }
        .pt-btn-name { font-family:'Bebas Neue',sans-serif; font-size:15px; letter-spacing:2px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .pt-btn-sub { font-size:10px; color:rgba(255,255,255,0.3); margin-top:2px; letter-spacing:1px; }
        .pt-A { border-color:rgba(0,255,200,0.25); }
        .pt-A:hover { background:rgba(0,255,200,0.1); border-color:#00ffc8; }
        .pt-B { border-color:rgba(255,50,80,0.25); }
        .pt-B:hover { background:rgba(255,50,80,0.1); border-color:#ff3250; }
        .picker-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); padding:10px; }
        .picker-title { font-size:9px; letter-spacing:3px; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-bottom:8px; }
        .picker-btns { display:flex; gap:8px; flex-wrap:wrap; }
        .picker-btn { padding:8px 16px; cursor:pointer; background:rgba(0,255,200,0.07); border:1px solid rgba(0,255,200,0.2); color:#00ffc8; font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; transition:all 0.15s; }
        .picker-btn:hover { background:#00ffc8; color:#000; }
        .ctrl-row { display:flex; gap:8px; }
        .ctrl-btn { flex:1; padding:10px; text-align:center; cursor:pointer; font-family:'Rajdhani',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; transition:all 0.2s; border:none; }
        .c-undo { background:rgba(255,184,0,0.1); color:#ffb800; border:1px solid rgba(255,184,0,0.2); }
        .c-undo:hover { background:rgba(255,184,0,0.2); }
        .c-undo:disabled { opacity:0.3; cursor:not-allowed; }
        .c-next { background:rgba(0,136,255,0.1); color:#0088ff; border:1px solid rgba(0,136,255,0.2); }
        .c-next:hover { background:rgba(0,136,255,0.2); }
        .c-reset { background:rgba(255,50,80,0.1); color:#ff3250; border:1px solid rgba(255,50,80,0.2); }
        .c-reset:hover { background:rgba(255,50,80,0.2); }
        .point-log { flex-shrink:0; max-height:190px; overflow-y:auto; border-top:1px solid rgba(255,255,255,0.05); }
        .log-hdr { display:flex; align-items:center; gap:10px; padding:7px 12px; position:sticky; top:0; background:#080a0f; z-index:1; }
        .log-lbl { font-size:9px; letter-spacing:3px; color:rgba(255,255,255,0.25); text-transform:uppercase; font-weight:700; white-space:nowrap; }
        .log-line { flex:1; height:1px; background:rgba(255,255,255,0.05); }
        .log-cnt { font-size:9px; color:rgba(255,255,255,0.2); letter-spacing:1px; white-space:nowrap; }
        .log-item { display:flex; align-items:center; gap:9px; padding:7px 12px; border-bottom:1px solid rgba(255,255,255,0.04); }
        .log-item:first-child { background:rgba(0,255,200,0.03); }
        .log-icon { font-size:14px; flex-shrink:0; width:20px; text-align:center; }
        .log-info { flex:1; min-width:0; }
        .log-player { font-size:13px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .log-item:first-child .log-player { color:#00ffc8; }
        .log-comm { font-size:10px; color:rgba(255,255,255,0.3); letter-spacing:0.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .log-score { font-family:'Bebas Neue',sans-serif; font-size:15px; letter-spacing:1px; flex-shrink:0; }
        .ls-A { color:#00ffc8; } .ls-B { color:#ff3250; }
        .log-time { font-size:9px; color:rgba(255,255,255,0.2); flex-shrink:0; letter-spacing:1px; }
        .log-empty { padding:10px 12px; font-size:11px; color:rgba(255,255,255,0.2); letter-spacing:1px; }
        .flash-wrap { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(8,10,15,0.98); border:1px solid rgba(0,255,200,0.5); box-shadow:0 0 60px rgba(0,255,200,0.2); padding:22px 32px; text-align:center; z-index:100; pointer-events:none; animation:flashIn 0.25s ease; min-width:240px; }
        @keyframes flashIn { from{opacity:0;transform:translate(-50%,-60%) scale(0.9)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .f-icon { font-size:38px; margin-bottom:5px; }
        .f-player { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:3px; color:#00ffc8; }
        .f-shot { font-size:11px; letter-spacing:2px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:3px; }
        .f-score { font-family:'Bebas Neue',sans-serif; font-size:20px; color:#fff; margin-top:6px; letter-spacing:2px; }
        .cam-pip { position:fixed; top:58px; right:10px; width:150px; height:90px; background:#000; border:1px solid rgba(0,255,200,0.3); z-index:50; overflow:hidden; }
        .cam-pip video { width:100%; height:100%; object-fit:cover; }
        .cam-close { position:absolute; top:3px; right:5px; background:none; border:none; color:#fff; cursor:pointer; font-size:13px; z-index:51; }
        .winner-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.92); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:200; animation:fadeIn 0.5s ease; padding:20px; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .w-trophy { font-size:64px; margin-bottom:10px; }
        .w-name { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:5px; color:#00ffc8; text-shadow:0 0 40px rgba(0,255,200,0.5); text-align:center; line-height:1.1; animation:pulse 1s ease infinite; }
        @keyframes pulse { 0%,100%{text-shadow:0 0 40px rgba(0,255,200,0.5)} 50%{text-shadow:0 0 80px rgba(0,255,200,0.9)} }
        .w-sub { font-size:13px; letter-spacing:5px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin:12px 0 28px; }
        .w-btn { padding:14px 44px; background:#00ffc8; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:4px; color:#000; transition:all 0.3s; }
        .w-btn:hover { background:#fff; box-shadow:0 0 40px rgba(0,255,200,0.5); }
      `}</style>

      {/* HEADER */}
      <div className="hdr">
        <button className="hdr-btn" onClick={onBack}>← Back</button>
        <div className="live-badge">
          <div className="live-dot" />
          <div className="live-txt">Live · Game {game}</div>
        </div>
        <button className={`hdr-btn ${showCamera ? "cam-on" : ""}`} onClick={() => setShowCamera(v => !v)}>
          📷 {showCamera ? "Hide" : "Camera"}
        </button>
      </div>

      {/* SCOREBOARD */}
      <div className="scoreboard">
        <div className={`team-col ${playerA > playerB ? "leading" : ""}`}>
          <div className="t-name">{matchData?.teamA || "Team A"}</div>
          <div className="t-players">{teamAPlayers.join(" / ") || "—"}</div>
          <div className="t-score">{playerA}</div>
        </div>
        <div className="mid-col">
          <div className="live-dot" />
          <div className="mid-vs">VS</div>
          <div className="mid-game">Game</div>
          <div className="mid-gnum">{game}</div>
        </div>
        <div className={`team-col ${playerB > playerA ? "leading" : ""}`}>
          <div className="t-name">{matchData?.teamB || "Team B"}</div>
          <div className="t-players">{teamBPlayers.join(" / ") || "—"}</div>
          <div className="t-score">{playerB}</div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className={`status-bar ${isDeuce ? "s-deuce" : isMatchPt ? "s-mp" : ""}`}>
        {isDeuce ? "⚡ DEUCE!" : isMatchPt ? "🔴 MATCH POINT!" : ""}
      </div>

      {/* SCORER PANEL */}
      <div className="scorer-panel">
        <div>
          <div className="sec-title">1 · Shot type (optional)</div>
          <div className="shot-grid">
            {SHOT_TYPES.map(s => (
              <div
                key={s.label}
                className={`shot-btn ${selectedShot?.label === s.label ? "sel" : ""}`}
                onClick={() => setSelectedShot(selectedShot?.label === s.label ? null : s)}
              >
                <div className="shot-icon">{s.icon}</div>
                <div className="shot-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedShot && (
          <div className="sel-bar">
            <span>{selectedShot.icon}</span>
            <span className="sel-bar-txt">{selectedShot.label} selected</span>
            <button className="sel-bar-clr" onClick={() => setSelectedShot(null)}>✕</button>
          </div>
        )}

        <div>
          <div className="sec-title">2 · Award point to</div>
          <div className="point-btns">
            <div className="pt-btn pt-A" onClick={() => handlePointBtn("A")}>
              <div className="pt-btn-name">{matchData?.teamA || "Team A"}</div>
              <div className="pt-btn-sub">
                {teamAPlayers.length > 1 ? "pick player →" : teamAPlayers[0] || "+ Point"}
              </div>
            </div>
            <div className="pt-btn pt-B" onClick={() => handlePointBtn("B")}>
              <div className="pt-btn-name">{matchData?.teamB || "Team B"}</div>
              <div className="pt-btn-sub">
                {teamBPlayers.length > 1 ? "pick player →" : teamBPlayers[0] || "+ Point"}
              </div>
            </div>
          </div>
        </div>

        {scoringTeam && getPlayers(scoringTeam).length > 1 && (
          <div className="picker-wrap">
            <div className="picker-title">
              Who scored for {matchData?.[`team${scoringTeam}`] || `Team ${scoringTeam}`}?
            </div>
            <div className="picker-btns">
              {getPlayers(scoringTeam).map(p => (
                <div key={p} className="picker-btn" onClick={() => commitPoint(scoringTeam, p)}>{p}</div>
              ))}
            </div>
          </div>
        )}

        <div className="ctrl-row">
          <button className="ctrl-btn c-undo" disabled={undoStack.length === 0} onClick={handleUndo}>
            ↩ Undo
          </button>
          <button className="ctrl-btn c-next" onClick={handleNextGame}>Next Game →</button>
          <button className="ctrl-btn c-reset" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {/* POINT LOG */}
      <div className="point-log">
        <div className="log-hdr">
          <div className="log-lbl">📋 Point Log</div>
          <div className="log-line" />
          <div className="log-cnt">{pointLog.length} pts</div>
        </div>
        {pointLog.length === 0
          ? <div className="log-empty">No points yet — select a shot and tap a team above.</div>
          : pointLog.map(entry => (
            <div className="log-item" key={entry.id}>
              <div className="log-icon">{entry.icon}</div>
              <div className="log-info">
                <div className="log-player">{entry.playerName} · {entry.shot}</div>
                <div className="log-comm">{entry.commentary}</div>
              </div>
              <div className={`log-score ${entry.team === "A" ? "ls-A" : "ls-B"}`}>{entry.scoreA}–{entry.scoreB}</div>
              <div className="log-time">{entry.time}</div>
            </div>
          ))
        }
      </div>

      {lastPoint && (
        <div className="flash-wrap">
          <div className="f-icon">{lastPoint.icon}</div>
          <div className="f-player">{lastPoint.playerName}</div>
          <div className="f-shot">{lastPoint.shot}</div>
          <div className="f-score">{lastPoint.scoreA} – {lastPoint.scoreB}</div>
        </div>
      )}

      {showCamera && (
        <div className="cam-pip">
          <button className="cam-close" onClick={() => setShowCamera(false)}>✕</button>
          <video autoPlay muted playsInline ref={el => {
            if (el && !el.srcObject) {
              navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(s => { el.srcObject = s; })
                .catch(() => {});
            }
          }} />
        </div>
      )}

      {showWinner && (
        <div className="winner-overlay">
          <div className="w-trophy">🏆</div>
          <div className="w-name">{winner}</div>
          <div className="w-sub">Match Complete · GG WP</div>
          <button className="w-btn" onClick={() => {
            reset(); setShowWinner(false); setPointLog([]); setUndoStack([]);
            onMatchComplete?.("win"); onBack?.();
          }}>New Match</button>
        </div>
      )}
    </div>
  );
}

export default OverlayUI;