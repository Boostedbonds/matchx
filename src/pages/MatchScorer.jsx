import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import {
  createMatchState,
  addPoint,
  undoPoint,
  getPlayerStats,
  SHOT_TYPES,
} from "../utils/matchEngine";

// ─── Demo players (replace with real props once player select is wired up) ───
const DEMO_P1 = { name: "Rahul Sharma", init: "RS", club: "Eagles FC", rating: 2104 };
const DEMO_P2 = { name: "Arjun Mehta",  init: "AM", club: "Smash FC",  rating: 1980 };

// ─── Component ────────────────────────────────────────────────────────────────

export default function MatchScorer({ onNav, onLogout, user, player1 = DEMO_P1, player2 = DEMO_P2 }) {
  const [match, setMatch]         = useState(() => createMatchState(player1, player2));
  const [shotPicker, setShotPicker] = useState(null); // "p1" | "p2" | null
  const [tab, setTab]             = useState("score"); // "score" | "stats"
  const [flash, setFlash]         = useState(null);   // "p1" | "p2" for score flash
  const commentaryRef             = useRef(null);

  const gIdx   = match.currentGame - 1;
  const score  = match.scores[gIdx];
  const isLive = match.status === "live";

  // Flash animation on point
  function triggerFlash(who) {
    setFlash(who);
    setTimeout(() => setFlash(null), 600);
  }

  // Step 1: tap point button → open shot picker
  function handlePointTap(scorer) {
    if (!isLive) return;
    setShotPicker(scorer);
  }

  // Step 2: pick shot type → commit point
  function handleShotPick(shotType) {
    const scorer = shotPicker;
    setShotPicker(null);
    const next = addPoint(match, { scorer, shotType });
    triggerFlash(scorer);
    setMatch(next);
  }

  function handleUndo() {
    setMatch(undoPoint(match));
  }

  const p1Stats = getPlayerStats(match.events, "p1");
  const p2Stats = getPlayerStats(match.events, "p2");

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ms-main { margin-left: 220px; flex: 1; padding: 28px 32px; overflow-y: auto; min-height: 100vh; }

        /* ── Top bar ── */
        .ms-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ms-title  { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 4px; color: #fff; }
        .ms-sub    { font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 2px; }

        .ms-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 24px; }
        .ms-tab  { font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; padding: 12px 24px; cursor: pointer; color: rgba(255,255,255,0.3); border-bottom: 2px solid transparent; transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none; }
        .ms-tab:hover  { color: rgba(255,255,255,0.7); }
        .ms-tab.active { color: #00ffc8; border-bottom-color: #00ffc8; }

        /* ── Scoreboard ── */
        .scoreboard {
          display: grid; grid-template-columns: 1fr 80px 1fr;
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 16px; overflow: hidden; position: relative;
        }

        .score-side {
          padding: 28px 24px; display: flex; flex-direction: column;
          align-items: center; gap: 6px; position: relative;
          transition: background 0.3s;
          cursor: default;
        }

        .score-side.flash-win  { animation: flashWin 0.6s ease-out; }
        @keyframes flashWin { 0%,100%{background:transparent} 30%{background:rgba(0,255,200,0.12)} }

        .score-side.server::after {
          content: '▶ SERVING';
          position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
          font-family: 'Rajdhani', sans-serif; font-size: 9px; letter-spacing: 3px;
          color: #00ffc8; font-weight: 700;
        }

        .sb-init {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #000;
          border: 2px solid rgba(0,255,200,0.25);
        }

        .sb-name  { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 3px; color: #fff; text-align: center; line-height: 1; }
        .sb-club  { font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
        .sb-rating{ font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(0,255,200,0.5); letter-spacing: 2px; }

        .sb-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 80px; line-height: 1; color: #00ffc8;
          text-shadow: 0 0 30px rgba(0,255,200,0.3);
          transition: transform 0.15s;
          margin-top: 8px;
        }

        .sb-games { display: flex; gap: 6px; margin-top: 6px; }
        .sb-game-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 12px; }
        .sb-game-dot.won  { background: #00ffc8; color: #000; }
        .sb-game-dot.lost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2); }

        .sb-center {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05);
          padding: 16px 0;
        }

        .sb-vs    { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: rgba(255,255,255,0.15); }
        .sb-game-label { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; }
        .sb-set-scores { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.3); text-align: center; letter-spacing: 1px; }

        /* ── Point Buttons ── */
        .point-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }

        .point-btn {
          padding: 22px 16px;
          background: rgba(0,255,200,0.06);
          border: 1px solid rgba(0,255,200,0.2);
          color: #00ffc8; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 3px;
          transition: all 0.15s; display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          text-transform: uppercase;
        }

        .point-btn:hover:not(:disabled) {
          background: rgba(0,255,200,0.14);
          border-color: rgba(0,255,200,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,255,200,0.15);
        }

        .point-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .point-btn .pb-init { font-size: 13px; color: rgba(255,255,255,0.35); letter-spacing: 2px; }

        .undo-btn {
          width: 100%; padding: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s; margin-bottom: 20px;
        }

        .undo-btn:hover:not(:disabled) { color: #fff; border-color: rgba(255,255,255,0.2); }
        .undo-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── Shot Picker Modal ── */
        .sp-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          z-index: 300; display: flex; align-items: center; justify-content: center;
        }

        .sp-modal {
          background: #0d0f15; border: 1px solid rgba(0,255,200,0.2);
          padding: 32px; width: 480px;
          box-shadow: 0 0 80px rgba(0,255,200,0.12);
          animation: sp-in 0.18s ease-out;
        }

        @keyframes sp-in { from { opacity:0; transform: scale(0.95) translateY(8px); } to { opacity:1; transform: none; } }

        .sp-header {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 3px; color: #fff; margin-bottom: 6px;
        }

        .sp-sub {
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          color: rgba(0,255,200,0.6); letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 24px;
        }

        .sp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

        .sp-btn {
          padding: 16px 8px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; text-align: center; transition: all 0.15s;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }

        .sp-btn:hover { background: rgba(0,255,200,0.1); border-color: rgba(0,255,200,0.3); transform: translateY(-2px); }

        .sp-icon  { font-size: 22px; }
        .sp-label { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 2px; color: #fff; }
        .sp-desc  { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 1px; color: rgba(255,255,255,0.3); }

        .sp-cancel {
          width: 100%; margin-top: 14px; padding: 12px;
          background: none; border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          letter-spacing: 2px; font-weight: 700; text-transform: uppercase;
          transition: all 0.2s;
        }

        .sp-cancel:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

        /* ── Commentary Feed ── */
        .commentary-feed {
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.06);
          max-height: 280px; overflow-y: auto;
        }

        .commentary-header {
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
          font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
          position: sticky; top: 0; background: #0d0f15;
        }

        .live-pulse {
          width: 7px; height: 7px; border-radius: 50%;
          background: #ff3250; animation: blink 1s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .commentary-line {
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);
          font-family: 'Rajdhani', sans-serif; font-size: 14px;
          font-weight: 600; color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px; line-height: 1.4;
          transition: background 0.2s;
        }

        .commentary-line:first-child { color: #fff; background: rgba(0,255,200,0.03); }
        .commentary-line:hover { background: rgba(255,255,255,0.02); }

        .commentary-empty {
          padding: 32px 16px; text-align: center;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.2); letter-spacing: 2px;
        }

        /* ── Stats Panel ── */
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .stat-block {
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.06);
          padding: 20px;
        }

        .stat-block-title {
          font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          margin-bottom: 16px; padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .shot-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
        }

        .shot-row-label {
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.6);
          width: 64px; flex-shrink: 0;
        }

        .shot-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .shot-bar-fill { height: 100%; background: linear-gradient(90deg, #00ffc8, #0088ff); border-radius: 3px; transition: width 0.5s ease; }
        .shot-bar-val { font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #00ffc8; width: 28px; text-align: right; flex-shrink: 0; }

        .mini-stat-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
          font-family: 'Rajdhani', sans-serif;
        }

        .mini-stat-label { font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 1px; }
        .mini-stat-val   { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #ffb800; }

        /* ── Match Won Banner ── */
        .won-banner {
          background: linear-gradient(135deg, rgba(0,255,200,0.08), rgba(0,136,255,0.08));
          border: 1px solid rgba(0,255,200,0.25);
          padding: 28px; text-align: center; margin-bottom: 20px;
        }

        .won-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 6px; color: #00ffc8; }
        .won-sub   { font-family: 'Rajdhani', sans-serif; font-size: 13px; letter-spacing: 3px; color: rgba(255,255,255,0.4); margin-top: 4px; }
      `}</style>

      <Sidebar active="setup" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="ms-main">

        {/* Header */}
        <div className="ms-topbar">
          <div>
            <div className="ms-title">🏸 Live Scorer</div>
            <div className="ms-sub">
              Game {match.currentGame} of 3 &nbsp;·&nbsp;
              {match.status === "live" ? "In Progress" : "Match Complete"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ms-tabs">
          {["score", "stats"].map(t => (
            <button key={t} className={`ms-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "score" ? "🏸 Scoring" : "📊 Stats"}
            </button>
          ))}
        </div>

        {/* Match won banner */}
        {match.status === "finished" && (
          <div className="won-banner">
            <div className="won-title">
              🏆 {match.winner === "p1" ? player1.name : player2.name} Wins!
            </div>
            <div className="won-sub">
              {match.gamesWon.p1} – {match.gamesWon.p2} &nbsp;·&nbsp; Match Complete
            </div>
          </div>
        )}

        {tab === "score" && (
          <>
            {/* Scoreboard */}
            <div className="scoreboard">
              {/* P1 */}
              <div className={`score-side ${match.server === "p1" ? "server" : ""} ${flash === "p1" ? "flash-win" : ""}`}>
                <div className="sb-init">{player1.init}</div>
                <div className="sb-name">{player1.name}</div>
                <div className="sb-club">{player1.club}</div>
                <div className="sb-rating">ELO {player1.rating}</div>
                <div className="sb-score">{score.p1}</div>
                <div className="sb-games">
                  {[0, 1].map(i => (
                    <div key={i} className={`sb-game-dot ${match.gamesWon.p1 > i ? "won" : "lost"}`}>
                      {match.gamesWon.p1 > i ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center */}
              <div className="sb-center">
                <div className="sb-vs">VS</div>
                <div className="sb-game-label">Game {match.currentGame}</div>
                <div className="sb-set-scores">
                  {match.scores.map((s, i) => (
                    i < match.currentGame - 1
                      ? <div key={i}>{s.p1}–{s.p2}</div>
                      : null
                  ))}
                </div>
              </div>

              {/* P2 */}
              <div className={`score-side ${match.server === "p2" ? "server" : ""} ${flash === "p2" ? "flash-win" : ""}`}>
                <div className="sb-init">{player2.init}</div>
                <div className="sb-name">{player2.name}</div>
                <div className="sb-club">{player2.club}</div>
                <div className="sb-rating">ELO {player2.rating}</div>
                <div className="sb-score">{score.p2}</div>
                <div className="sb-games">
                  {[0, 1].map(i => (
                    <div key={i} className={`sb-game-dot ${match.gamesWon.p2 > i ? "won" : "lost"}`}>
                      {match.gamesWon.p2 > i ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Point Buttons */}
            <div className="point-btns">
              <button className="point-btn" disabled={!isLive} onClick={() => handlePointTap("p1")}>
                <span className="pb-init">{player1.init}</span>
                ⚡ Point — {player1.name.split(" ")[0]}
              </button>
              <button className="point-btn" disabled={!isLive} onClick={() => handlePointTap("p2")}>
                <span className="pb-init">{player2.init}</span>
                ⚡ Point — {player2.name.split(" ")[0]}
              </button>
            </div>

            {/* Undo */}
            <button
              className="undo-btn"
              disabled={match.undoStack.length === 0}
              onClick={handleUndo}
            >
              ↩ Undo Last Point
            </button>

            {/* Commentary Feed */}
            <div className="commentary-feed" ref={commentaryRef}>
              <div className="commentary-header">
                <div className="live-pulse" />
                Live Commentary
              </div>
              {match.commentary.length === 0
                ? <div className="commentary-empty">Commentary will appear here as points are scored.</div>
                : match.commentary.map((line, i) => (
                    <div className="commentary-line" key={i}>{line}</div>
                  ))
              }
            </div>
          </>
        )}

        {tab === "stats" && (
          <div className="stats-grid">
            {/* P1 Stats */}
            <StatBlock player={player1} stats={p1Stats} color="#00ffc8" />
            {/* P2 Stats */}
            <StatBlock player={player2} stats={p2Stats} color="#0088ff" />
          </div>
        )}
      </div>

      {/* Shot Picker Modal */}
      {shotPicker && (
        <div className="sp-overlay" onClick={() => setShotPicker(null)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-header">
              How did {shotPicker === "p1" ? player1.name.split(" ")[0] : player2.name.split(" ")[0]} win it?
            </div>
            <div className="sp-sub">Select the shot type</div>
            <div className="sp-grid">
              {SHOT_TYPES.map(s => (
                <button key={s.id} className="sp-btn" onClick={() => handleShotPick(s.id)}>
                  <span className="sp-icon">{s.icon}</span>
                  <span className="sp-label">{s.label}</span>
                  <span className="sp-desc">{s.description}</span>
                </button>
              ))}
            </div>
            <button className="sp-cancel" onClick={() => setShotPicker(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Block Sub-component ─────────────────────────────────────────────────

function StatBlock({ player, stats, color }) {
  if (!stats) {
    return (
      <div className="stat-block">
        <div className="stat-block-title">{player.name} — No points yet</div>
      </div>
    );
  }

  const maxShot = Math.max(...Object.values(stats.shotCounts), 1);

  return (
    <div className="stat-block">
      <div className="stat-block-title" style={{ color }}>
        {player.init} — {player.name}
      </div>

      {/* Shot distribution */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "Rajdhani", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>
          Shot Distribution
        </div>
        {Object.entries(stats.shotCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([shot, count]) => {
            const info = { smash:"💥", drop:"🪶", net:"🕸️", drive:"➡️", clear:"🏹", lift:"⬆️", push:"👋", error:"❌" };
            return (
              <div className="shot-row" key={shot}>
                <div className="shot-row-label">{info[shot]} {shot}</div>
                <div className="shot-bar-bg">
                  <div className="shot-bar-fill" style={{ width: `${(count / maxShot) * 100}%`, background: `linear-gradient(90deg, ${color}, #0088ff)` }} />
                </div>
                <div className="shot-bar-val">{count}</div>
              </div>
            );
          })
        }
      </div>

      {/* Mini stats */}
      {[
        { label: "Total Points",     val: stats.totalPoints },
        { label: "Serving Points",   val: stats.servingPoints },
        { label: "Receiving Points", val: stats.receivingPoints },
        { label: "Clutch Points",    val: stats.clutchPoints },
        { label: "Best Streak",      val: `${stats.maxStreak}🔥` },
        { label: "Top Shot",         val: stats.topShot ? stats.topShot[0] : "—" },
      ].map((s, i) => (
        <div className="mini-stat-row" key={i}>
          <span className="mini-stat-label">{s.label}</span>
          <span className="mini-stat-val">{s.val}</span>
        </div>
      ))}
    </div>
  );
}