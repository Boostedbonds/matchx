import { useState } from "react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "setup", label: "New Match", icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings", label: "Rankings", icon: "📊" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function Tournament({ onNav }) {
  const [tab, setTab] = useState("upcoming");

  const tournaments = {
    upcoming: [
      { name: "State Badminton Championship", date: "Apr 5–7, 2026", location: "Delhi Sports Complex", prize: "₹50,000", players: 64, status: "Open" },
      { name: "Club League Season 4", date: "Apr 12, 2026", location: "Smash FC Court", prize: "₹12,000", players: 32, status: "Open" },
      { name: "MatchX Open 2026", date: "May 1–3, 2026", location: "National Stadium", prize: "₹1,00,000", players: 128, status: "Soon" },
    ],
    ongoing: [
      { name: "City Doubles Cup", date: "Mar 27–30, 2026", location: "Haryana Indoor", prize: "₹25,000", players: 48, status: "Live" },
    ],
    completed: [
      { name: "Winter Smash 2025", date: "Dec 10–15, 2025", location: "Punjab Arena", prize: "₹30,000", players: 64, winner: "Rahul Sharma", status: "Done" },
      { name: "Club Cup 2025", date: "Nov 5, 2025", location: "Smash FC Court", prize: "₹8,000", players: 16, winner: "Dev Patel", status: "Done" },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sidebar { width: 240px; min-height: 100vh; background: #0d0f15; border-right: 1px solid rgba(0,255,200,0.08); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
        .sidebar-logo { padding: 28px 24px; border-bottom: 1px solid rgba(0,255,200,0.08); }
        .sidebar-logo h1 { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 4px; color: #fff; }
        .sidebar-logo h1 span { color: #00ffc8; }
        .sidebar-logo p { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 2px; }
        .nav-items { padding: 20px 12px; flex: 1; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 4px; cursor: pointer; margin-bottom: 4px; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.35); transition: all 0.2s; border: 1px solid transparent; }
        .nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
        .nav-item.active { color: #00ffc8; background: rgba(0,255,200,0.06); border-color: rgba(0,255,200,0.15); }

        .main { margin-left: 240px; flex: 1; padding: 32px; }

        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 4px; color: #fff; }
        .page-sub { font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 3px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 4px; }

        .create-btn { padding: 14px 28px; background: #00ffc8; border: none; cursor: pointer; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: #000; transition: all 0.3s; }
        .create-btn:hover { background: #fff; box-shadow: 0 0 30px rgba(0,255,200,0.4); }

        .tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 28px; }
        .tab { font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; padding: 14px 24px; cursor: pointer; color: rgba(255,255,255,0.3); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab:hover { color: rgba(255,255,255,0.7); }
        .tab.active { color: #00ffc8; border-bottom-color: #00ffc8; }

        .tournament-grid { display: flex; flex-direction: column; gap: 16px; }

        .t-card { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); padding: 28px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden; }
        .t-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent, #00ffc8); }
        .t-card:hover { border-color: rgba(0,255,200,0.2); transform: translateX(4px); }

        .t-name { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: #fff; margin-bottom: 8px; }
        .t-meta { display: flex; gap: 20px; }
        .t-meta-item { font-family: 'Rajdhani', sans-serif; font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 1px; display: flex; align-items: center; gap: 5px; }

        .t-right { text-align: right; }
        .t-prize { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #ffb800; letter-spacing: 1px; text-shadow: 0 0 15px rgba(255,184,0,0.3); }
        .t-prize-label { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.25); text-transform: uppercase; margin-bottom: 12px; }

        .status-badge { display: inline-block; padding: 5px 14px; font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; }
        .status-Open { background: rgba(0,255,200,0.1); color: #00ffc8; border: 1px solid rgba(0,255,200,0.25); }
        .status-Live { background: rgba(255,50,80,0.15); color: #ff3250; border: 1px solid rgba(255,50,80,0.3); animation: pulse 1s infinite; }
        .status-Soon { background: rgba(255,184,0,0.1); color: #ffb800; border: 1px solid rgba(255,184,0,0.25); }
        .status-Done { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.08); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .winner-tag { font-family: 'Rajdhani', sans-serif; font-size: 12px; color: #ffb800; margin-top: 8px; }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-logo"><h1>Match<span>X</span></h1><p>Badminton Platform</p></div>
        <div className="nav-items">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${n.id === "tournament" ? "active" : ""}`} onClick={() => onNav(n.id)}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
      </div>

      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">🏆 Tournaments</div>
            <div className="page-sub">Season 2026 · All Categories</div>
          </div>
          <button className="create-btn">+ Create Tournament</button>
        </div>

        <div className="tabs">
          {["upcoming", "ongoing", "completed"].map(t => (
            <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t} {t === "ongoing" && <span style={{ color: "#ff3250" }}>●</span>}
            </div>
          ))}
        </div>

        <div className="tournament-grid">
          {tournaments[tab].map((t, i) => (
            <div key={i} className="t-card" style={{ "--accent": t.status === "Live" ? "#ff3250" : t.status === "Done" ? "rgba(255,255,255,0.1)" : "#00ffc8" }}>
              <div>
                <div className="t-name">{t.name}</div>
                <div className="t-meta">
                  <div className="t-meta-item">📅 {t.date}</div>
                  <div className="t-meta-item">📍 {t.location}</div>
                  <div className="t-meta-item">👥 {t.players} Players</div>
                </div>
                {t.winner && <div className="winner-tag">🏅 Winner: {t.winner}</div>}
              </div>
              <div className="t-right">
                <div className="t-prize-label">Prize Pool</div>
                <div className="t-prize">{t.prize}</div>
                <div className={`status-badge status-${t.status}`}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tournament;