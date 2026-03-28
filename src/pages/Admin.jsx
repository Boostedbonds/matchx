// src/pages/Admin.jsx
// Admin panel — shows everything in Supabase.
// Access via: tap logo 5 times on dashboard, or add "admin" to nav for dev.

import { useState, useEffect } from "react";
import {
  fetchMatches,
  fetchPlayers,
  fetchEvents,
  fetchCommentary,
} from "../utils/supabase";

export default function Admin({ onBack }) {
  const [tab,      setTab]      = useState("matches");
  const [matches,  setMatches]  = useState([]);
  const [players,  setPlayers]  = useState([]);
  const [selected, setSelected] = useState(null); // selected match for detail
  const [detail,   setDetail]   = useState(null); // { events, commentary }
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([fetchMatches(50), fetchPlayers()])
      .then(([m, p]) => { setMatches(m); setPlayers(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function openMatch(match) {
    setSelected(match);
    const [events, commentary] = await Promise.all([
      fetchEvents(match.id),
      fetchCommentary(match.id),
    ]);
    setDetail({ events, commentary });
  }

  const liveMatches = matches.filter(m => m.status === "live");
  const doneMatches = matches.filter(m => m.status === "finished");

  return (
    <div style={{ minHeight: "100vh", background: "#04060a", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-header {
          background: #0d0f15;
          border-bottom: 1px solid rgba(255,50,80,0.2);
          padding: 20px 32px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .adm-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 4px; color: #fff; }
        .adm-title span { color: #ff3250; }

        .adm-badge {
          padding: 5px 14px;
          background: rgba(255,50,80,0.1);
          border: 1px solid rgba(255,50,80,0.3);
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 3px; color: #ff3250;
          text-transform: uppercase;
        }

        .adm-back {
          background: none; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.35); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          padding: 8px 16px; transition: all 0.2s;
        }
        .adm-back:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

        /* Stats strip */
        .adm-strip {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .adm-stat {
          padding: 20px 28px;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .adm-stat:last-child { border-right: none; }

        .adm-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; color: var(--c, #00ffc8); line-height: 1;
        }

        .adm-stat-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 4px;
        }

        /* Tabs */
        .adm-tabs {
          display: flex; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 32px;
        }

        .adm-tab {
          padding: 14px 20px; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          border-bottom: 2px solid transparent; transition: all 0.2s;
          background: none; border-top: none; border-left: none; border-right: none;
        }

        .adm-tab.active { color: #00ffc8; border-bottom-color: #00ffc8; }
        .adm-tab:hover:not(.active) { color: rgba(255,255,255,0.6); }

        /* Content */
        .adm-body { padding: 28px 32px; }

        /* Match rows */
        .adm-match-row {
          display: grid;
          grid-template-columns: 200px 1fr 120px 100px 80px;
          gap: 0; padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center; cursor: pointer;
          transition: background 0.15s;
          font-family: 'Rajdhani', sans-serif;
        }

        .adm-match-row:hover { background: rgba(255,255,255,0.02); }

        .adm-match-row.header {
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
          cursor: default; border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .adm-match-row.header:hover { background: none; }

        .adm-match-vs {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 17px; letter-spacing: 1px; color: #fff;
        }

        .adm-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; color: #00ffc8; letter-spacing: 2px;
        }

        .adm-status {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 3px 10px; display: inline-block;
        }

        .adm-status.live     { color: #ff3250; background: rgba(255,50,80,0.1); border: 1px solid rgba(255,50,80,0.25); animation: blink 1s infinite; }
        .adm-status.finished { color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .adm-time {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 1px;
        }

        /* Player rows */
        .adm-player-row {
          display: grid;
          grid-template-columns: 44px 1fr 80px 60px 60px 80px 80px;
          gap: 0; padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center; font-family: 'Rajdhani', sans-serif;
        }

        .adm-player-row.header {
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.2); text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .adm-p-init {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 12px; color: #000;
        }

        .adm-p-name { font-size: 14px; font-weight: 700; color: #fff; }
        .adm-p-club { font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
        .adm-p-num  { font-family: 'Bebas Neue', sans-serif; font-size: 18px; }

        /* Match detail modal */
        .adm-detail-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 400; display: flex; align-items: flex-start;
          justify-content: center; padding: 32px 20px; overflow-y: auto;
        }

        .adm-detail {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.08);
          width: 100%; max-width: 760px;
          padding: 32px;
          animation: adm-in 0.2s ease;
        }

        @keyframes adm-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

        .adm-detail-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }

        .adm-detail-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 3px; color: #fff;
        }

        .adm-close {
          background: none; border: none;
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-size: 22px; transition: color 0.2s;
        }
        .adm-close:hover { color: #fff; }

        .adm-section-title {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          letter-spacing: 3px; color: rgba(255,255,255,0.2);
          text-transform: uppercase; margin-bottom: 12px;
          padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .adm-event-row {
          display: grid; grid-template-columns: 40px 60px 1fr 80px 80px;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .adm-commentary-line {
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.6); line-height: 1.4;
        }

        .adm-commentary-line:first-child { color: #fff; }

        .adm-empty {
          padding: 48px; text-align: center;
          font-family: 'Rajdhani', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.15); letter-spacing: 2px;
        }

        .adm-table { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 768px) {
          .adm-body { padding: 16px; }
          .adm-strip { grid-template-columns: 1fr 1fr; }
          .adm-match-row { grid-template-columns: 1fr 80px 80px; }
          .adm-match-row > *:nth-child(2),
          .adm-match-row > *:nth-child(5) { display: none; }
          .adm-player-row { grid-template-columns: 36px 1fr 70px 60px; }
          .adm-player-row > *:nth-child(5),
          .adm-player-row > *:nth-child(6),
          .adm-player-row > *:nth-child(7) { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="adm-header">
        <div>
          <div className="adm-title">Match<span>X</span> Admin</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="adm-badge">⚠ Admin Panel</div>
          <button className="adm-back" onClick={onBack}>← Back to App</button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="adm-strip">
        <div className="adm-stat" style={{ "--c": "#ff3250" }}>
          <div className="adm-stat-val">{liveMatches.length}</div>
          <div className="adm-stat-label">Live Matches</div>
        </div>
        <div className="adm-stat" style={{ "--c": "#00ffc8" }}>
          <div className="adm-stat-val">{doneMatches.length}</div>
          <div className="adm-stat-label">Completed</div>
        </div>
        <div className="adm-stat" style={{ "--c": "#ffb800" }}>
          <div className="adm-stat-val">{players.length}</div>
          <div className="adm-stat-label">Players</div>
        </div>
        <div className="adm-stat" style={{ "--c": "#0088ff" }}>
          <div className="adm-stat-val">{matches.length}</div>
          <div className="adm-stat-label">Total Matches</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {[
          { id: "matches", label: "All Matches" },
          { id: "live",    label: `Live (${liveMatches.length})` },
          { id: "players", label: "Players" },
        ].map(t => (
          <button
            key={t.id}
            className={`adm-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="adm-body">
        {loading && (
          <div className="adm-empty">Loading data from Supabase…</div>
        )}

        {/* ── All Matches ── */}
        {!loading && tab === "matches" && (
          <div className="adm-table">
            <div className="adm-match-row header">
              <div>Match</div>
              <div>Score</div>
              <div>Status</div>
              <div>Winner</div>
              <div>Time</div>
            </div>
            {matches.length === 0 && (
              <div className="adm-empty">No matches yet.</div>
            )}
            {matches.map(m => {
              const s = m.scores?.[( m.current_game || 1) - 1] || { p1: 0, p2: 0 };
              return (
                <div key={m.id} className="adm-match-row" onClick={() => openMatch(m)}>
                  <div className="adm-match-vs">
                    {m.player1_name} vs {m.player2_name}
                  </div>
                  <div className="adm-score">{s.p1} – {s.p2}</div>
                  <div>
                    <span className={`adm-status ${m.status}`}>
                      {m.status === "live" ? "● Live" : "Done"}
                    </span>
                  </div>
                  <div style={{ fontFamily: "Rajdhani", fontSize: 12, color: "#00ffc8", fontWeight: 700 }}>
                    {m.winner
                      ? (m.winner === "p1" ? m.player1_name : m.player2_name).split(" ")[0]
                      : "—"}
                  </div>
                  <div className="adm-time">
                    {new Date(m.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Live Matches ── */}
        {!loading && tab === "live" && (
          <div>
            {liveMatches.length === 0 && (
              <div className="adm-empty">No matches currently live.</div>
            )}
            {liveMatches.map(m => {
              const gIdx = (m.current_game || 1) - 1;
              const s    = m.scores?.[gIdx] || { p1: 0, p2: 0 };
              const gw   = m.games_won || { p1: 0, p2: 0 };
              return (
                <div
                  key={m.id}
                  onClick={() => openMatch(m)}
                  style={{ background: "#0d0f15", border: "1px solid rgba(255,50,80,0.2)", padding: 24, marginBottom: 14, cursor: "pointer", transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff3250", animation: "blink 1s infinite" }}/>
                    <div style={{ fontFamily: "Rajdhani", fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#ff3250", textTransform: "uppercase" }}>
                      Live · Game {m.current_game}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2, color: "#fff", marginBottom: 8 }}>
                    {m.player1_name} vs {m.player2_name}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 52, color: "#00ffc8", letterSpacing: 4, lineHeight: 1 }}>
                    {s.p1} – {s.p2}
                  </div>
                  <div style={{ fontFamily: "Rajdhani", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8, letterSpacing: 1 }}>
                    Games: {gw.p1} – {gw.p2} · Started {new Date(m.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Players ── */}
        {!loading && tab === "players" && (
          <div className="adm-table">
            <div className="adm-player-row header">
              <div/>
              <div>Player</div>
              <div>Rating</div>
              <div>Wins</div>
              <div>Losses</div>
              <div>Points</div>
              <div>Top Shot</div>
            </div>
            {players.length === 0 && (
              <div className="adm-empty">No players yet.</div>
            )}
            {players.map((p, i) => {
              const shots = { smash: p.smash_count, drop: p.drop_count, net: p.net_count, drive: p.drive_count, clear: p.clear_count, lift: p.lift_count, push: p.push_count };
              const topShot = Object.entries(shots).sort((a, b) => b[1] - a[1])[0];
              return (
                <div key={p.id} className="adm-player-row">
                  <div><div className="adm-p-init">{p.init}</div></div>
                  <div>
                    <div className="adm-p-name">{p.name}</div>
                    <div className="adm-p-club">{p.club}</div>
                  </div>
                  <div className="adm-p-num" style={{ color: "#00ffc8" }}>{p.rating}</div>
                  <div className="adm-p-num" style={{ color: "#00ff64" }}>{p.wins}</div>
                  <div className="adm-p-num" style={{ color: "#ff3250" }}>{p.losses}</div>
                  <div className="adm-p-num" style={{ color: "#ffb800" }}>{p.points?.toLocaleString()}</div>
                  <div style={{ fontFamily: "Rajdhani", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
                    {topShot?.[1] > 0 ? topShot[0] : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Match detail modal */}
      {selected && (
        <div className="adm-detail-overlay" onClick={() => { setSelected(null); setDetail(null); }}>
          <div className="adm-detail" onClick={e => e.stopPropagation()}>
            <div className="adm-detail-header">
              <div>
                <div className="adm-detail-title">
                  {selected.player1_name} vs {selected.player2_name}
                </div>
                <div style={{ fontFamily: "Rajdhani", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginTop: 4 }}>
                  {new Date(selected.started_at).toLocaleString()} · {selected.status}
                  {selected.winner && ` · Winner: ${selected.winner === "p1" ? selected.player1_name : selected.player2_name}`}
                </div>
              </div>
              <button className="adm-close" onClick={() => { setSelected(null); setDetail(null); }}>✕</button>
            </div>

            {!detail && <div style={{ fontFamily: "Rajdhani", fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>Loading…</div>}

            {detail && (
              <>
                {/* Commentary */}
                <div className="adm-section-title" style={{ marginBottom: 10 }}>
                  Commentary ({detail.commentary.length} lines)
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 28 }}>
                  {detail.commentary.length === 0
                    ? <div style={{ fontFamily: "Rajdhani", fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "12px 0" }}>No commentary recorded.</div>
                    : detail.commentary.map((line, i) => (
                        <div className="adm-commentary-line" key={i}>{line}</div>
                      ))
                  }
                </div>

                {/* Events */}
                <div className="adm-section-title">
                  Point Log ({detail.events.length} points)
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {detail.events.length === 0
                    ? <div style={{ fontFamily: "Rajdhani", fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "12px 0" }}>No events recorded.</div>
                    : (
                      <>
                        <div className="adm-event-row" style={{ fontFamily: "Rajdhani", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                          <div>G</div><div>Rally</div><div>Shot</div><div>Scorer</div><div>Score</div>
                        </div>
                        {detail.events.map((e, i) => (
                          <div className="adm-event-row" key={i}>
                            <div style={{ color: "#ffb800" }}>{e.game}</div>
                            <div>{e.rally}</div>
                            <div style={{ color: "#00ffc8", textTransform: "capitalize" }}>{e.shot_type}</div>
                            <div style={{ color: e.scorer === "p1" ? "#00ffc8" : "#0088ff" }}>
                              {e.scorer === "p1" ? selected.player1_init : selected.player2_init}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.4)" }}>
                              {e.score_after?.p1}–{e.score_after?.p2}
                            </div>
                          </div>
                        ))}
                      </>
                    )
                  }
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}