import { useState } from "react";
import Sidebar from "../components/Sidebar";

const TABS = ["Overview", "Stats", "History", "Badges", "Settings"];

function Profile({ user, onNav, onLogout }) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .main {
          margin-left: 220px; flex: 1;
          min-height: 100vh; overflow-y: auto;
          display: flex; flex-direction: column;
        }

        .profile-hero {
          background: linear-gradient(180deg, #0d1520 0%, #080a0f 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 40px 40px 0;
          position: relative; overflow: hidden; flex-shrink: 0;
        }

        .profile-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% -20%, rgba(0,255,200,0.08), transparent 60%);
          pointer-events: none;
        }

        .profile-header { display: flex; align-items: flex-end; gap: 28px; margin-bottom: 32px; }

        .user-avatar-lg {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #000;
          border: 3px solid rgba(0,255,200,0.4);
          box-shadow: 0 0 30px rgba(0,255,200,0.2); flex-shrink: 0;
        }

        .profile-meta { flex: 1; }

        .profile-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px; letter-spacing: 4px; color: #fff; line-height: 1; margin-bottom: 6px;
        }

        .profile-club {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; letter-spacing: 3px; color: rgba(255,255,255,0.35); text-transform: uppercase;
        }

        .profile-badges { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

        .badge-pill {
          font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 1px; font-weight: 700;
          padding: 4px 12px; background: rgba(0,255,200,0.08); border: 1px solid rgba(0,255,200,0.2); color: #00ffc8;
        }

        .profile-quick-stats { display: flex; gap: 32px; }

        .pqs { text-align: center; padding: 0 0 24px; }

        .pqs-val {
          font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #00ffc8;
          text-shadow: 0 0 20px rgba(0,255,200,0.3); line-height: 1;
        }

        .pqs-label {
          font-family: 'Rajdhani', sans-serif; font-size: 10px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25); text-transform: uppercase; margin-top: 4px;
        }

        .tabs {
          display: flex; border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0 -40px; padding: 0 40px; overflow-x: auto;
        }

        .tab {
          font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 2px; font-weight: 700;
          text-transform: uppercase; padding: 16px 24px; cursor: pointer;
          color: rgba(255,255,255,0.3); border-bottom: 2px solid transparent;
          transition: all 0.2s; white-space: nowrap;
        }

        .tab:hover { color: rgba(255,255,255,0.7); }
        .tab.active { color: #00ffc8; border-bottom-color: #00ffc8; }

        .content { padding: 32px 40px; flex: 1; }

        .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .card { background: #0d0f15; border: 1px solid rgba(255,255,255,0.06); padding: 24px; margin-bottom: 20px; }
        .card:last-child { margin-bottom: 0; }

        .card-title {
          font-family: 'Rajdhani', sans-serif; font-size: 11px; letter-spacing: 3px;
          color: rgba(255,255,255,0.3); text-transform: uppercase;
          margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .stat-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .stat-row:last-child { border-bottom: none; }

        .stat-row-label { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 1px; text-transform: uppercase; }
        .stat-row-val { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #fff; letter-spacing: 1px; }
        .stat-row-val.green { color: #00ff64; }
        .stat-row-val.red { color: #ff3250; }
        .stat-row-val.gold { color: #ffb800; }
        .stat-row-val.cyan { color: #00ffc8; }

        .progress-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 8px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; }

        .badge-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .badge-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          padding: 16px; text-align: center; transition: all 0.2s;
        }

        .badge-card.earned { background: rgba(0,255,200,0.04); border-color: rgba(0,255,200,0.15); }
        .badge-card:hover { border-color: rgba(0,255,200,0.2); }

        .badge-icon { font-size: 28px; margin-bottom: 8px; }
        .badge-name { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .badge-desc { font-family: 'Rajdhani', sans-serif; font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 4px; }

        .history-item {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .history-item:last-child { border-bottom: none; }

        .result-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .result-dot.win { background: #00ff64; box-shadow: 0 0 8px #00ff64; }
        .result-dot.loss { background: #ff3250; box-shadow: 0 0 8px #ff3250; }

        .history-teams { flex: 1; font-family: 'Rajdhani', sans-serif; }
        .history-vs { font-size: 14px; font-weight: 700; color: #fff; }
        .history-meta { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; letter-spacing: 1px; }
        .history-score { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #00ffc8; letter-spacing: 1px; }

        .result-tag {
          font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 2px; padding: 3px 9px; text-transform: uppercase;
        }

        .settings-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .settings-item:last-child { border-bottom: none; }

        .settings-label { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
        .settings-val { font-family: 'Rajdhani', sans-serif; font-size: 13px; color: #00ffc8; }

        .toggle {
          width: 44px; height: 24px; background: rgba(0,255,200,0.2);
          border-radius: 12px; position: relative; cursor: pointer; border: 1px solid rgba(0,255,200,0.3);
        }
        .toggle::after {
          content: ''; position: absolute; width: 18px; height: 18px;
          background: #00ffc8; border-radius: 50%; top: 2px; right: 3px; transition: right 0.2s;
        }

        .danger-btn {
          padding: 10px 20px; background: rgba(255,50,80,0.08);
          border: 1px solid rgba(255,50,80,0.2); color: #ff3250; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s;
        }
        .danger-btn:hover { background: rgba(255,50,80,0.18); }

        .view-all-btn {
          width: 100%; padding: 12px; margin-top: 16px;
          background: none; border: 1px solid rgba(0,255,200,0.15);
          color: #00ffc8; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; transition: all 0.2s;
        }
        .view-all-btn:hover { background: rgba(0,255,200,0.06); }
      `}</style>

      <Sidebar active="profile" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-header">
            <div className="user-avatar-lg">{user.avatar}</div>
            <div className="profile-meta">
              <div className="profile-name">{user.name}</div>
              <div className="profile-club">🏸 {user.club} · Badminton Player</div>
              <div className="profile-badges">
                {user.badges.map((b, i) => <div key={i} className="badge-pill">{b}</div>)}
              </div>
            </div>
            <div className="profile-quick-stats">
              <div className="pqs"><div className="pqs-val">#{user.rank}</div><div className="pqs-label">Global Rank</div></div>
              <div className="pqs"><div className="pqs-val">{user.rating}</div><div className="pqs-label">ELO Rating</div></div>
              <div className="pqs"><div className="pqs-val">{user.points.toLocaleString()}</div><div className="pqs-label">Points</div></div>
              <div className="pqs"><div className="pqs-val">{user.winRate}%</div><div className="pqs-label">Win Rate</div></div>
            </div>
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <div key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>{t}</div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="content">

          {activeTab === "Overview" && (
            <div className="section-grid">
              <div className="card">
                <div className="card-title">Performance</div>
                {[
                  { label: "Matches Played", val: user.wins + user.losses, cls: "" },
                  { label: "Wins", val: user.wins, cls: "green" },
                  { label: "Losses", val: user.losses, cls: "red" },
                  { label: "Win Streak", val: `${user.streak} 🔥`, cls: "gold" },
                  { label: "Best Rank", val: "#8", cls: "cyan" },
                ].map((s, i) => (
                  <div className="stat-row" key={i}>
                    <div className="stat-row-label">{s.label}</div>
                    <div className={`stat-row-val ${s.cls}`}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">Season Progress</div>
                {[
                  { label: "Season Points", val: user.points, max: 5000, color: "#00ffc8" },
                  { label: "ELO Rating", val: user.rating, max: 3000, color: "#0088ff" },
                  { label: "Win Rate", val: user.winRate, max: 100, color: "#00ff64" },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontFamily: "'Rajdhani'", fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: s.color }}>{s.val}</div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (s.val / s.max) * 100)}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Stats" && (
            <div className="section-grid">
              <div className="card">
                <div className="card-title">Game Stats</div>
                {[
                  { label: "Avg Points Per Game", val: "18.4" },
                  { label: "Longest Rally", val: "47 shots" },
                  { label: "Smash Rate", val: "34%" },
                  { label: "Net Points", val: "28%" },
                  { label: "Service Faults", val: "4.2%" },
                  { label: "Deuce Wins", val: "67%" },
                ].map((s, i) => (
                  <div className="stat-row" key={i}>
                    <div className="stat-row-label">{s.label}</div>
                    <div className="stat-row-val cyan">{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">Team Stats</div>
                {[
                  { label: "Doubles Wins", val: "18" },
                  { label: "Mixed Doubles", val: "12W 3L" },
                  { label: "Team Rating", val: "1920" },
                  { label: "Best Partner", val: "Arjun M." },
                  { label: "Club Rank", val: "#2" },
                  { label: "Tournaments", val: "6 played" },
                ].map((s, i) => (
                  <div className="stat-row" key={i}>
                    <div className="stat-row-label">{s.label}</div>
                    <div className="stat-row-val gold">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "History" && (
            <div className="card">
              <div className="card-title">Match History</div>
              {[
                { vs: "Rahul S.", score: "21–15, 21–18", result: "win", date: "Today", type: "Singles" },
                { vs: "Dev P.", score: "19–21, 21–19, 21–23", result: "loss", date: "Yesterday", type: "Singles" },
                { vs: "Arjun M.", score: "21–12, 21–17", result: "win", date: "Mar 26", type: "Singles" },
                { vs: "Karan T.", score: "21–9, 21–14", result: "win", date: "Mar 25", type: "Singles" },
                { vs: "Priya K.", score: "15–21, 21–19, 18–21", result: "loss", date: "Mar 24", type: "Doubles" },
                { vs: "Sneha R.", score: "21–17, 21–20", result: "win", date: "Mar 23", type: "Doubles" },
                { vs: "Meera S.", score: "21–14, 21–11", result: "win", date: "Mar 22", type: "Singles" },
                { vs: "Rohan D.", score: "18–21, 15–21", result: "loss", date: "Mar 20", type: "Singles" },
              ].map((m, i) => (
                <div className="history-item" key={i}>
                  <div className={`result-dot ${m.result}`} />
                  <div className="history-teams">
                    <div className="history-vs">vs {m.vs}</div>
                    <div className="history-meta">{m.type} · {m.date}</div>
                  </div>
                  <div className="history-score">{m.score}</div>
                  <div className="result-tag" style={{ background: m.result === "win" ? "rgba(0,255,100,0.08)" : "rgba(255,50,80,0.08)", border: `1px solid ${m.result === "win" ? "rgba(0,255,100,0.2)" : "rgba(255,50,80,0.2)"}`, color: m.result === "win" ? "#00ff64" : "#ff3250" }}>
                    {m.result}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Badges" && (
            <div className="card">
              <div className="card-title">Achievements · {user.badges.length} Earned</div>
              <div className="badge-grid">
                {[
                  { icon: "🏆", name: "Champion", desc: "Won 1st tournament", earned: user.badges.some(b => b.includes("Champion")) },
                  { icon: "🔥", name: "Hot Streak", desc: "5 wins in a row", earned: user.badges.some(b => b.includes("Hot Streak")) },
                  { icon: "⚡", name: "Speed Demon", desc: "Win 10 matches", earned: user.badges.some(b => b.includes("Speed Demon")) },
                  { icon: "🎯", name: "Sharpshooter", desc: "Win 25 matches", earned: user.wins >= 25 },
                  { icon: "🛡️", name: "Iron Wall", desc: "2,500 points earned", earned: user.points >= 2500 },
                  { icon: "👑", name: "Top 10", desc: "Reached global rank #10", earned: user.rank <= 10 },
                  { icon: "🌟", name: "Rising Star", desc: "Earn 5,000 points", earned: user.points >= 5000 },
                  { icon: "🤝", name: "Team Player", desc: "10 doubles victories", earned: false },
                ].map((b, i) => (
                  <div key={i} className={`badge-card ${b.earned ? "earned" : ""}`} style={{ opacity: b.earned ? 1 : 0.4 }}>
                    <div className="badge-icon">{b.icon}</div>
                    <div className="badge-name" style={{ color: b.earned ? "#00ffc8" : "rgba(255,255,255,0.4)" }}>{b.name}</div>
                    <div className="badge-desc">{b.desc}</div>
                    <div style={{ fontFamily: "'Rajdhani'", fontSize: 10, letterSpacing: 2, marginTop: 6, color: b.earned ? "#00ff64" : "rgba(255,255,255,0.2)" }}>
                      {b.earned ? "✓ UNLOCKED" : "🔒 LOCKED"}
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-btn" onClick={() => onNav("badges")}>View All Badges & Progress →</button>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="section-grid">
              <div className="card">
                <div className="card-title">Account</div>
                {[
                  { label: "Display Name", val: user.name },
                  { label: "Club", val: user.club },
                  { label: "Country", val: "India 🇮🇳" },
                  { label: "Member Since", val: "Jan 2024" },
                  { label: "ELO Rating", val: user.rating },
                  { label: "Global Rank", val: `#${user.rank}` },
                ].map((s, i) => (
                  <div className="settings-item" key={i}>
                    <div className="settings-label">{s.label}</div>
                    <div className="settings-val">{s.val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="card">
                  <div className="card-title">Preferences</div>
                  {["Live Notifications", "Score Alerts", "Commentary", "Public Profile", "Challenge Requests"].map((s, i) => (
                    <div className="settings-item" key={i}>
                      <div className="settings-label">{s}</div>
                      <div className="toggle" />
                    </div>
                  ))}
                </div>
                <div className="card" style={{ marginTop: 20 }}>
                  <div className="card-title">Danger Zone</div>
                  <div className="settings-item">
                    <div className="settings-label">Logout Account</div>
                    <button className="danger-btn" onClick={onLogout}>🚪 Logout</button>
                  </div>
                  <div className="settings-item">
                    <div className="settings-label">Reset All Stats</div>
                    <button className="danger-btn">⚠️ Reset</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;