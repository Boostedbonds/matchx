import { useState } from "react";
import Sidebar from "../components/Sidebar";

const ALL_PLAYERS = [
  { name: "Rahul Sharma", init: "RS", club: "Eagles FC", rating: 2104, wins: 48, losses: 6, points: 8920, status: "online", playing: false, streak: 8, winRate: 89 },
  { name: "Arjun Mehta", init: "AM", club: "Smash FC", rating: 1980, wins: 41, losses: 9, points: 7840, status: "online", playing: true, streak: 3, winRate: 82 },
  { name: "Priya Kapoor", init: "PK", club: "Rally Club", rating: 1923, wins: 38, losses: 11, points: 7210, status: "online", playing: false, streak: 2, winRate: 78 },
  { name: "Dev Patel", init: "DP", club: "Court Kings", rating: 1847, wins: 34, losses: 8, points: 6540, status: "online", playing: false, streak: 4, winRate: 81 },
  { name: "Sneha Rao", init: "SR", club: "Smash FC", rating: 1790, wins: 30, losses: 14, points: 5980, status: "away", playing: false, streak: 1, winRate: 68 },
  { name: "Karan Tiwari", init: "KT", club: "Eagles FC", rating: 1724, wins: 27, losses: 17, points: 5320, status: "online", playing: true, streak: 2, winRate: 61 },
  { name: "Meera Singh", init: "MS", club: "Net Ninjas", rating: 1680, wins: 25, losses: 19, points: 4800, status: "online", playing: false, streak: 0, winRate: 57 },
  { name: "Rohan Das", init: "RD", club: "Court Kings", rating: 1635, wins: 22, losses: 20, points: 4350, status: "offline", playing: false, streak: 0, winRate: 52 },
  { name: "Anjali Verma", init: "AV", club: "Net Ninjas", rating: 1590, wins: 19, losses: 21, points: 3900, status: "online", playing: false, streak: 1, winRate: 48 },
  { name: "Vikram Bose", init: "VB", club: "Rally Club", rating: 1540, wins: 16, losses: 24, points: 3400, status: "away", playing: false, streak: 0, winRate: 40 },
];

function Players({ onNav, onLogout }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = ALL_PLAYERS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase());
    if (filter === "online") return p.status === "online" && !p.playing && matchSearch;
    if (filter === "playing") return p.playing && matchSearch;
    if (filter === "available") return p.status === "online" && !p.playing && matchSearch;
    return matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        .main { margin-left: 220px; flex: 1; padding: 32px; overflow-y: auto; }
        @media (max-width: 768px) { .main { margin-left: 0; padding: 20px 16px 80px; } }

        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 44px; letter-spacing: 4px; color: #fff; margin-bottom: 4px; }
        .page-sub { font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 28px; }

        .toolbar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; flex-wrap: wrap; }

        .search-input {
          flex: 1; min-width: 180px; padding: 12px 16px;
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.08);
          color: #fff; font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: 1px; outline: none;
          transition: border 0.2s;
        }
        .search-input:focus { border-color: rgba(0,255,200,0.3); }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }

        .filter-btn {
          padding: 10px 18px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .filter-btn.active { background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.3); color: #00ffc8; }
        .filter-btn:hover:not(.active) { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }

        .players-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        @media (max-width: 480px) { .players-grid { grid-template-columns: 1fr; } }

        .player-card {
          background: #0d0f15; border: 1px solid rgba(255,255,255,0.06);
          padding: 20px; cursor: pointer;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .player-card::before {
          content: ''; position: absolute; top: 0; left: 0;
          width: 100%; height: 2px; background: var(--sc, transparent); transition: background 0.2s;
        }
        .player-card:hover { border-color: rgba(0,255,200,0.2); transform: translateY(-2px); }
        .player-card:hover::before { background: #00ffc8; }

        .pc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .pc-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #000;
          position: relative; flex-shrink: 0;
        }
        .pc-status-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 11px; height: 11px; border-radius: 50%; border: 2px solid #0d0f15;
        }
        .pc-status-dot.online  { background: #00ff64; }
        .pc-status-dot.away    { background: #ffb800; }
        .pc-status-dot.offline { background: rgba(255,255,255,0.2); }
        .pc-status-dot.playing { background: #ff3250; animation: blink 1s infinite; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .pc-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; color: #fff; line-height: 1; }
        .pc-club { font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-top: 2px; }

        .pc-status-label {
          font-family: 'Rajdhani', sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px;
        }
        .pc-status-label.online  { color: #00ff64; background: rgba(0,255,100,0.08); border: 1px solid rgba(0,255,100,0.15); }
        .pc-status-label.away    { color: #ffb800; background: rgba(255,184,0,0.08); border: 1px solid rgba(255,184,0,0.15); }
        .pc-status-label.offline { color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
        .pc-status-label.playing { color: #ff3250; background: rgba(255,50,80,0.08); border: 1px solid rgba(255,50,80,0.2); animation: blink 1s infinite; }

        .pc-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 14px; }
        .pc-stat { text-align: center; background: rgba(255,255,255,0.02); padding: 8px 4px; }
        .pc-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #00ffc8; line-height: 1; }
        .pc-stat-label { font-family: 'Rajdhani', sans-serif; font-size: 9px; letter-spacing: 2px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 2px; }

        .challenge-btn-full {
          width: 100%; padding: 11px;
          background: rgba(0,255,200,0.08); border: 1px solid rgba(0,255,200,0.2);
          color: #00ffc8; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 3px;
          transition: all 0.2s;
        }
        .challenge-btn-full:hover { background: #00ffc8; color: #000; }
        .challenge-btn-full:disabled { opacity: 0.3; cursor: not-allowed; background: none; color: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.06); }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
          z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal {
          background: #0d0f15; border: 1px solid rgba(0,255,200,0.15);
          padding: 36px; width: 100%; max-width: 460px; position: relative;
          box-shadow: 0 0 80px rgba(0,255,200,0.1);
        }
        .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(255,255,255,0.3); font-size: 20px; cursor: pointer; }
        .modal-close:hover { color: #fff; }
      `}</style>

      <Sidebar active="players" onNav={onNav} onLogout={onLogout} />

      <div className="main">
        <div className="page-title">👥 Players</div>
        <div className="page-sub">
          {ALL_PLAYERS.filter(p => p.status === "online").length} Online ·{" "}
          {ALL_PLAYERS.filter(p => p.playing).length} In Match ·{" "}
          {ALL_PLAYERS.length} Total
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="🔍  Search players or clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {["all", "online", "available", "playing"].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div className="players-grid">
          {filtered.map((p, i) => (
            <div className="player-card" key={i} onClick={() => setSelected(p)}>
              <div className="pc-header">
                <div className="pc-avatar">
                  {p.init}
                  <div className={`pc-status-dot ${p.playing ? "playing" : p.status}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-club">{p.club}</div>
                </div>
                <div className={`pc-status-label ${p.playing ? "playing" : p.status}`}>
                  {p.playing ? "● Playing" : p.status === "online" ? "● Online" : p.status === "away" ? "● Away" : "Offline"}
                </div>
              </div>
              <div className="pc-stats">
                <div className="pc-stat"><div className="pc-stat-val">{p.rating}</div><div className="pc-stat-label">ELO</div></div>
                <div className="pc-stat"><div className="pc-stat-val">{p.winRate}%</div><div className="pc-stat-label">Win Rate</div></div>
                <div className="pc-stat"><div className="pc-stat-val">{p.wins}</div><div className="pc-stat-label">Wins</div></div>
              </div>
              <button
                className="challenge-btn-full"
                disabled={p.playing || p.status === "offline"}
                onClick={e => { e.stopPropagation(); onNav("setup"); }}
              >
                {p.playing ? "In a Match" : p.status === "offline" ? "Offline" : "⚡ Challenge"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#00ffc8,#0088ff)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: 24, color: "#000", border: "2px solid rgba(0,255,200,0.3)" }}>
                {selected.init}
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 3, color: "#fff" }}>{selected.name}</div>
                <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>🏸 {selected.club}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "ELO Rating", val: selected.rating, color: "#00ffc8" },
                { label: "Win Rate",   val: `${selected.winRate}%`, color: "#00ff64" },
                { label: "Points",     val: selected.points.toLocaleString(), color: "#ffb800" },
                { label: "Wins",       val: selected.wins, color: "#00ff64" },
                { label: "Losses",     val: selected.losses, color: "#ff3250" },
                { label: "Streak",     val: `${selected.streak}🔥`, color: "#ff3250" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: 14, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button
              style={{ width: "100%", padding: 14, background: "#00ffc8", border: "none", cursor: "pointer", fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 4, color: "#000", transition: "all 0.3s" }}
              disabled={selected.playing || selected.status === "offline"}
              onClick={() => { setSelected(null); onNav("setup"); }}
            >
              {selected.playing ? "Currently In a Match" : selected.status === "offline" ? "Player Offline" : `⚡ Challenge ${selected.name.split(" ")[0]}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Players;