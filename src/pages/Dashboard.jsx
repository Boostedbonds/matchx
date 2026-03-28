import { useState } from "react";
import Sidebar from "../components/Sidebar";

const ONLINE_PLAYERS = [
  { name: "Rahul Sharma", init: "RS", club: "Eagles FC", rating: 2104, status: "online", playing: false },
  { name: "Arjun Mehta", init: "AM", club: "Smash FC", rating: 1980, status: "online", playing: true },
  { name: "Priya Kapoor", init: "PK", club: "Rally Club", rating: 1923, status: "online", playing: false },
  { name: "Dev Patel", init: "DP", club: "Court Kings", rating: 1847, status: "online", playing: false },
  { name: "Sneha Rao", init: "SR", club: "Smash FC", rating: 1790, status: "away", playing: false },
  { name: "Karan Tiwari", init: "KT", club: "Eagles FC", rating: 1724, status: "online", playing: true },
];

function Dashboard({ user, onNav, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        .main {
          margin-left: 220px; flex: 1;
          padding: 32px;
          overflow-y: auto;
          min-height: 100vh;
        }

        .top-bar {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 32px;
        }

        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 44px; letter-spacing: 4px; color: #fff;
        }

        .live-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,50,80,0.1);
          border: 1px solid rgba(255,50,80,0.3);
          padding: 8px 16px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 3px; color: #ff3250;
          text-transform: uppercase;
        }

        .live-dot {
          width: 8px; height: 8px;
          background: #ff3250; border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 24px;
        }

        .stat-card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 20px;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }

        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--accent, #00ffc8);
        }

        .stat-card:hover { border-color: rgba(0,255,200,0.2); transform: translateY(-2px); }

        .stat-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase; margin-bottom: 8px;
        }

        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px; line-height: 1;
          color: var(--accent, #00ffc8);
        }

        .stat-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px;
        }

        .win-rate-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-top: 8px; overflow: hidden; }
        .win-rate-fill { height: 100%; background: linear-gradient(90deg,#00ffc8,#0088ff); border-radius: 2px; }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
        }

        .card {
          background: #0d0f15;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 22px;
          margin-bottom: 20px;
        }

        .card:last-child { margin-bottom: 0; }

        .card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between; align-items: center;
        }

        .card-title-action {
          font-size: 10px; letter-spacing: 2px;
          color: #00ffc8; cursor: pointer;
        }

        .match-item {
          display: flex; align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 14px;
        }

        .match-item:last-child { border-bottom: none; }

        .match-teams { flex: 1; font-family: 'Rajdhani', sans-serif; }
        .match-vs { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .match-meta { font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.3); }

        .match-score {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 2px; color: #00ffc8;
        }

        .match-badge {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; letter-spacing: 2px;
          padding: 3px 9px; font-weight: 700; text-transform: uppercase;
        }

        .badge-win { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid rgba(0,255,100,0.2); }
        .badge-loss { background: rgba(255,50,80,0.1); color: #ff3250; border: 1px solid rgba(255,50,80,0.2); }
        .badge-live { background: rgba(255,50,80,0.15); color: #ff3250; border: 1px solid rgba(255,50,80,0.3); animation: blink 1s infinite; }

        .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .action-btn {
          padding: 16px 12px;
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

        .action-icon { font-size: 22px; margin-bottom: 6px; }
        .action-label { font-size: 11px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.6); }

        /* Online Players */
        .online-player-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer; transition: background 0.2s;
        }

        .online-player-row:last-child { border-bottom: none; }
        .online-player-row:hover { background: rgba(255,255,255,0.02); margin: 0 -8px; padding: 10px 8px; }

        .op-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg,#00ffc8,#0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #000;
          flex-shrink: 0; position: relative;
        }

        .status-dot {
          position: absolute; bottom: 0; right: 0;
          width: 9px; height: 9px; border-radius: 50%;
          border: 2px solid #0d0f15;
        }

        .status-dot.online { background: #00ff64; }
        .status-dot.away { background: #ffb800; }
        .status-dot.playing { background: #ff3250; animation: blink 1s infinite; }

        .op-info { flex: 1; }
        .op-name { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; color: #fff; }
        .op-status { font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 1px; }
        .op-status.online { color: #00ff64; }
        .op-status.away { color: #ffb800; }
        .op-status.playing { color: #ff3250; }

        .op-rating { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #00ffc8; letter-spacing: 1px; }

        .challenge-btn {
          padding: 5px 12px;
          background: rgba(0,255,200,0.08);
          border: 1px solid rgba(0,255,200,0.2);
          color: #00ffc8; cursor: pointer;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; transition: all 0.2s;
        }

        .challenge-btn:hover { background: rgba(0,255,200,0.15); }
        .challenge-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .start-match-btn {
          width: 100%; padding: 16px;
          background: #00ffc8; border: none; cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 4px; color: #000;
          transition: all 0.3s; margin-top: 14px;
        }

        .start-match-btn:hover { background: #fff; box-shadow: 0 0 40px rgba(0,255,200,0.5); }
      `}</style>

      <Sidebar active="dashboard" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        <div className="top-bar">
          <h2 className="page-title">Dashboard</h2>
          <div className="live-badge">
            <div className="live-dot" />
            2 Live Matches
          </div>
        </div>

        {/* Stats */}
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
          {/* Left */}
          <div>
            <div className="card">
              <div className="card-title">
                Recent Matches
                <span className="card-title-action" onClick={() => onNav("profile")}>View All →</span>
              </div>
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
                  <div className={`match-badge badge-${m.result}`}>{m.result === "live" ? "● Live" : m.result}</div>
                </div>
              ))}
              <button className="start-match-btn" onClick={() => onNav("setup")}>+ Start New Match</button>
            </div>

            {/* Online Players */}
            <div className="card">
              <div className="card-title">
                Online Players
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff64", display: "inline-block" }} />
                  <span style={{ fontFamily: "Rajdhani", fontSize: 11, color: "#00ff64", letterSpacing: 2 }}>
                    {ONLINE_PLAYERS.filter(p => p.status === "online").length} Online
                  </span>
                </span>
              </div>
              {ONLINE_PLAYERS.map((p, i) => (
                <div className="online-player-row" key={i}>
                  <div className="op-avatar">
                    {p.init}
                    <div className={`status-dot ${p.playing ? "playing" : p.status}`} />
                  </div>
                  <div className="op-info">
                    <div className="op-name">{p.name}</div>
                    <div className={`op-status ${p.playing ? "playing" : p.status}`}>
                      {p.playing ? "● In a match" : p.status === "online" ? "● Online" : "● Away"}
                    </div>
                  </div>
                  <div className="op-rating">{p.rating}</div>
                  <button
                    className="challenge-btn"
                    disabled={p.playing}
                    onClick={() => onNav("setup")}
                  >
                    {p.playing ? "Busy" : "Challenge"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="card">
              <div className="card-title">Quick Actions</div>
              <div className="quick-actions">
                <div className="action-btn" onClick={() => onNav("setup")}>
                  <div className="action-icon">🏸</div>
                  <div className="action-label">New Match</div>
                </div>
                <div className="action-btn" onClick={() => onNav("tournament")}>
                  <div className="action-icon">🏆</div>
                  <div className="action-label">Tournament</div>
                </div>
                <div className="action-btn" onClick={() => onNav("spectator")}>
                  <div className="action-icon">📡</div>
                  <div className="action-label">Watch Live</div>
                </div>
                <div className="action-btn" onClick={() => onNav("rankings")}>
                  <div className="action-icon">📊</div>
                  <div className="action-label">Rankings</div>
                </div>
                <div className="action-btn" onClick={() => onNav("badges")}>
                  <div className="action-icon">🎖️</div>
                  <div className="action-label">Badges</div>
                </div>
                <div className="action-btn" onClick={() => onNav("players")}>
                  <div className="action-icon">👥</div>
                  <div className="action-label">Players</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                Top Players
                <span className="card-title-action" onClick={() => onNav("rankings")}>Full →</span>
              </div>
              {ONLINE_PLAYERS.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: i < 3 ? "#00ffc8" : "rgba(255,255,255,0.2)", width: 24, textAlign: "center" }}>{i + 1}</div>
                  <div className="op-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{p.init}<div className={`status-dot ${p.playing ? "playing" : p.status}`} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{p.club}</div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#00ffc8" }}>{p.rating}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, rgba(0,255,200,0.06), rgba(0,136,255,0.06))", border: "1px solid rgba(0,255,200,0.15)" }}>
              <div className="card-title" style={{ color: "#00ffc8", borderColor: "rgba(0,255,200,0.1)" }}>🎖️ Next Badge</div>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🌟</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>Rising Star</div>
                <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 1, marginBottom: 14 }}>Reach 5,000 points</div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(user.points / 5000) * 100}%`, background: "linear-gradient(90deg,#00ffc8,#0088ff)", borderRadius: 3, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontFamily: "'Rajdhani'", fontSize: 11, color: "#00ffc8", marginTop: 6, letterSpacing: 1 }}>
                  {user.points.toLocaleString()} / 5,000 pts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;