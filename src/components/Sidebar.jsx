const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "setup", label: "New Match", icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings", label: "Rankings", icon: "📊" },
  { id: "players", label: "Players", icon: "👥" },
  { id: "badges", label: "Badges", icon: "🎖️" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function Sidebar({ active, user, onNav, onLogout }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sidebar {
          width: 220px; height: 100vh;
          background: #0d0f15;
          border-right: 1px solid rgba(0,255,200,0.08);
          display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0;
          z-index: 100; overflow-y: auto;
        }

        .sidebar-logo {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(0,255,200,0.08);
          flex-shrink: 0;
        }

        .sidebar-logo h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; letter-spacing: 4px; color: #fff;
        }

        .sidebar-logo h1 span { color: #00ffc8; }

        .sidebar-logo p {
          font-family: 'Rajdhani', sans-serif;
          font-size: 9px; letter-spacing: 3px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase; margin-top: 2px;
        }

        .nav-section-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 9px; letter-spacing: 3px;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
          padding: 16px 20px 6px;
        }

        .nav-items { padding: 8px 10px; flex: 1; }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 4px;
          cursor: pointer; margin-bottom: 2px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 600;
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

        .sidebar-bottom {
          border-top: 1px solid rgba(0,255,200,0.08);
          flex-shrink: 0;
        }

        .sidebar-user {
          padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; transition: background 0.2s;
        }

        .sidebar-user:hover { background: rgba(255,255,255,0.03); }

        .s-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14px; color: #000; flex-shrink: 0;
        }

        .s-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .s-rank {
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px; color: #00ffc8; letter-spacing: 1px;
        }

        .logout-btn {
          width: 100%; padding: 12px 16px;
          background: none; border: none; border-top: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,80,80,0.5);
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255,50,50,0.06);
          color: #ff5050;
        }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-logo">
          <h1>Match<span>X</span></h1>
          <p>Badminton Platform</p>
        </div>

        <div className="nav-items">
          <div className="nav-section-label">Main</div>
          {NAV.map(n => (
            <div
              key={n.id}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => onNav(n.id)}
            >
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          {user && (
            <div className="sidebar-user" onClick={() => onNav("profile")}>
              <div className="s-avatar">{user.avatar}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div className="s-name">{user.name}</div>
                <div className="s-rank">#{user.rank} · {user.rating} ELO</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
export { NAV };