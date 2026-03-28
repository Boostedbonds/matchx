import { useState } from "react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "setup", label: "New Match", icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings", label: "Rankings", icon: "📊" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function Dashboard({ user, onNav }) {
  const [activeNav, setActiveNav] = useState("dashboard");

  const navigate = (id) => {
    setActiveNav(id);
    onNav(id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sidebar {
          width: 240px; min-height: 100vh;
          background: #0d0f15;
          border-right: 1px solid rgba(0,255,200,0.08);
          display: flex; flex-direction: column;
          padding: 0; position: fixed; left: 0; top: 0; bottom: 0;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(0,255,200,0.08);
        }

        .sidebar-logo h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px; letter-spacing: 4px;
          color: #fff;
        }

        .sidebar-logo h1 span { color: #00ffc8; }

        .sidebar-logo p {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .nav-items { padding: 20px 12px; flex: 1; }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 4px;
          cursor: pointer; margin-bottom: 4px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.04);
        }

        .nav-item.active {
          color: #00ffc8;
          background: rgba(0,255,200,0.06);
          border-color: rgba(0,255,200,0.15);
        }

        .nav-icon { font-size: 16px; width: 20px; text-align: center; }

        .sidebar-user {
          padding: 20px;
          border-top: 1px solid rgba(0,255,200,0.08);
          display: flex; align-items: center; gap: 12px;
          cursor: pointer;
        }

        .user-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px; color: #000;
          flex-shrink: 0;
        }

        .user-info { flex: 1; overflow: hidden; }
        .user-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #fff; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .user-rank {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: #00ffc8;
          letter-spacing: 1px;
        }

        .main {
          margin-left: 240px; flex: 1;
          padding: 32px;
          min-height: 100vh;
        }

        .top-bar {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 36px;
        }

        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px; letter-spacing: 4px;
          color: #fff;
        }

        .live-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,50,80,0.1);
          border: 1px solid rgba(255,50,80,0.3);
          padding: 8px 16px; border-radius: 2px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 3px; color: #ff3250;
          text-transform: uppercase;
        }

        .live-dot {
          width: 8px; height: 8px;
          background: #ff3250; border-radius: 50%;
          animation: livePulse 1s ease infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 28px;
        }

        .stat-card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 24px;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }

        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--accent, #00ffc8);
        }

        .stat-card:hover {
          border-color: rgba(0,255,200,0.2);
          transform: translateY(-2px);
        }

        .stat-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase; margin-bottom: 10px;
        }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px; line-height: 1;
          color: var(--accent, #00ffc8);
          text-shadow: 0 0 20px rgba(0,255,200,0.3);
        }

        .stat-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3);
          margin-top: 4px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }

        .card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 24px;
        }

        .card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .match-item {
          display: flex; align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 16px;
        }

        .match-item:last-child { border-bottom: none; }

        .match-teams {
          flex: 1;
          font-family: 'Rajdhani', sans-serif;
        }

        .match-vs {
          font-size: 15px; font-weight: 700; color: #fff;
          margin-bottom: 4px;
        }

        .match-meta {
          font-size: 11px; letter-spacing: 1px;
          color: rgba(255,255,255,0.3);
        }

        .match-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 2px;
          color: #00ffc8;
        }

        .match-badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 2px;
          padding: 4px 10px;
          border-radius: 2px; font-weight: 700;
          text-transform: uppercase;
        }

        .badge-win { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid rgba(0,255,100,0.2); }
        .badge-loss { background: rgba(255,50,80,0.1); color: #ff3250; border: 1px solid rgba(255,50,80,0.2); }
        .badge-live { background: rgba(255,50,80,0.15); color: #ff3250; border: 1px solid rgba(255,50,80,0.3); animation: livePulse 1s infinite; }

        .quick-actions {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 20px;
        }

        .action-btn {
          padding: 20px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; text-align: center;
          transition: all 0.2s; color: #fff;
          font-family: 'Rajdhani', sans-serif;
        }

        .action-btn:hover {
          background: rgba(0,255,200,0.06);
          border-color: rgba(0,255,200,0.25);
          transform: translateY(-2px);
        }

        .action-icon { font-size: 24px; margin-bottom: 8px; }
        .action-label {
          font-size: 12px; letter-spacing: 2px;
          font-weight: 700; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }

        .player-row {
          display: flex; align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 14px;
        }

        .player-row:last-child { border-bottom: none; }

        .rank-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; color: rgba(255,255,255,0.2);
          width: 28px; text-align: center;
        }

        .rank-num.top { color: #00ffc8; }

        .player-avatar-sm {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px; color: #000; flex-shrink: 0;
        }

        .player-details { flex: 1; }
        .player-name-sm {
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 700; color: #fff;
        }
        .player-club-sm {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
        }

        .player-rating {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #00ffc8;
          letter-spacing: 1px;
        }

        .start-match-btn {
          width: 100%; padding: 18px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px; color: #000;
          transition: all 0.3s; margin-top: 16px;
        }

        .start-match-btn:hover {
          background: #fff;
          box-shadow: 0 0 40px rgba(0,255,200,0.5);
        }

        .win-rate-bar {
          height: 4px; background: rgba(255,255,255,0.06);
          border-radius: 2px; margin-top: 8px; overflow: hidden;
        }

        .win-rate-fill {
          height: 100%; background: linear-gradient(90deg, #00ffc8, #0088ff);
          border-radius: 2px;
          transition: width 1s ease;
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <h1>Match<span>X</span></h1>
          <p>Badminton Platform</p>
        </div>

        <div className="nav-items">
          {NAV.map(n => (
            <div
              key={n.id}
              className={`nav-item ${activeNav === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
        </div>

        <div className="sidebar-user" onClick={() => navigate("profile")}>
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-rank">Rank #{user.rank} · {user.rating} ELO</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        <div className="top-bar">
          <h2 className="page-title">Dashboard</h2>
          <div className="live-badge">
            <div className="live-dot" />
            2 Live Matches
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" style={{ "--accent": "#00ffc8" }}>
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{user.winRate}%</div>
            <div className="win-rate-bar"><div className="win-rate-fill" style={{ width: `${user.winRate}%` }} /></div>
          </div>
          <div className="stat-card" style={{ "--accent": "#0088ff" }}>
            <div className="stat-label">ELO Rating</div>
            <div className="stat-value">{user.rating}</div>
            <div className="stat-sub">+47 this month</div>
          </div>
          <div className="stat-card" style={{ "--accent": "#ff3250" }}>
            <div className="stat-label">Win Streak</div>
            <div className="stat-value">{user.streak}🔥</div>
            <div className="stat-sub">Personal best: 8</div>
          </div>
          <div className="stat-card" style={{ "--accent": "#ffb800" }}>
            <div className="stat-label">Points</div>
            <div className="stat-value">{user.points.toLocaleString()}</div>
            <div className="stat-sub">Season total</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Matches */}
          <div className="card">
            <div className="card-title">Recent Matches</div>
            {[
              { vs: "Rahul S. vs Arjun M.", score: "21–15, 21–18", result: "win", time: "Today, 4:30 PM", type: "Singles" },
              { vs: "Priya K. vs Sneha R.", score: "18–21, 21–19, 21–15", result: "live", time: "Live Now", type: "Doubles" },
              { vs: "Dev P. vs Karan T.", score: "21–17, 19–21, 21–23", result: "loss", time: "Yesterday", type: "Singles" },
              { vs: "Team Alpha vs Team Beta", score: "2–1", result: "win", time: "2 days ago", type: "Team" },
            ].map((m, i) => (
              <div className="match-item" key={i}>
                <div className="match-teams">
                  <div className="match-vs">{m.vs}</div>
                  <div className="match-meta">{m.type} · {m.time}</div>
                </div>
                <div className="match-score">{m.score}</div>
                <div className={`match-badge badge-${m.result}`}>
                  {m.result === "live" ? "● Live" : m.result}
                </div>
              </div>
            ))}

            <button className="start-match-btn" onClick={() => navigate("setup")}>
              + Start New Match
            </button>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Quick Actions */}
            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div className="quick-actions">
                <div className="action-btn" onClick={() => navigate("setup")}>
                  <div className="action-icon">🏸</div>
                  <div className="action-label">New Match</div>
                </div>
                <div className="action-btn" onClick={() => navigate("tournament")}>
                  <div className="action-icon">🏆</div>
                  <div className="action-label">Tournament</div>
                </div>
                <div className="action-btn">
                  <div className="action-icon">📡</div>
                  <div className="action-label">Watch Live</div>
                </div>
                <div className="action-btn" onClick={() => navigate("rankings")}>
                  <div className="action-icon">📊</div>
                  <div className="action-label">Rankings</div>
                </div>
              </div>
            </div>

            {/* Top Players */}
            <div className="card">
              <div className="card-title">Top Players</div>
              {[
                { name: "Rahul Sharma", club: "Eagles FC", rating: 2104, init: "RS" },
                { name: "Arjun Mehta", club: "Smash FC", rating: 1980, init: "AM" },
                { name: "Priya Kapoor", club: "Rally Club", rating: 1923, init: "PK" },
                { name: "Dev Patel", club: "Court Kings", rating: 1847, init: "DP" },
              ].map((p, i) => (
                <div className="player-row" key={i}>
                  <div className={`rank-num ${i < 3 ? "top" : ""}`}>{i + 1}</div>
                  <div className="player-avatar-sm">{p.init}</div>
                  <div className="player-details">
                    <div className="player-name-sm">{p.name}</div>
                    <div className="player-club-sm">{p.club}</div>
                  </div>
                  <div className="player-rating">{p.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;