import { useState, useEffect } from "react";

// ── Nav definitions ── Admin is intentionally EXCLUDED from all nav arrays ──
const NAV_SCORER = [
  { id: "dashboard",  label: "Dashboard",  icon: "⚡" },
  { id: "setup",      label: "New Match",  icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "profile",    label: "Profile",    icon: "👤" },
  // ⛔ ADMIN deliberately NOT listed here — access via logo tap only
];

const NAV_SPECTATOR = [
  { id: "dashboard",  label: "Matches",   icon: "📡" },
  { id: "rankings",   label: "Rankings",  icon: "📊" },
  { id: "players",    label: "Players",   icon: "👥" },
  { id: "profile",    label: "Profile",   icon: "👤" },
];

// Admin-only nav (shown after secret access or admin role)
const NAV_ADMIN = [
  { id: "dashboard",  label: "Dashboard", icon: "⚡" },
  { id: "admin",      label: "Admin",     icon: "🔧" },
  { id: "players",    label: "Players",   icon: "👥" },
  { id: "tournament", label: "Tournament",icon: "🏆" },
  { id: "rankings",   label: "Rankings",  icon: "📊" },
  { id: "profile",    label: "Profile",   icon: "👤" },
];

export default function Sidebar({ active, user, onNav, onLogout, role = "scorer" }) {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [logoTaps, setLogoTaps]                 = useState(0);
  const [tapHint, setTapHint]                   = useState(false);

  // Determine which nav to show
  const isAdmin = role === "admin" || user?.isAdmin;
  const NAV = isAdmin ? NAV_ADMIN : role === "spectator" ? NAV_SPECTATOR : NAV_SCORER;

  // Secret admin access — tap logo 5 times rapidly
  function handleLogoTap() {
    if (isAdmin) return; // already admin
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next === 3) setTapHint(true);
    if (next >= 5) {
      setLogoTaps(0);
      setTapHint(false);
      onNav("admin");
    }
    // Reset tap count after 2 seconds of inactivity
    setTimeout(() => {
      setLogoTaps(0);
      setTapHint(false);
    }, 2000);
  }

  useEffect(() => {
    function check() {
      setIsMobilePortrait(window.innerWidth <= 768 && window.innerHeight > window.innerWidth);
    }
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // ── Mobile portrait: bottom nav ───────────────────────────────────────────
  if (isMobilePortrait) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');

          .bottom-nav {
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 64px; z-index: 200;
            background: #0d0f15;
            border-top: 1px solid rgba(0,255,200,0.1);
            display: flex; align-items: stretch;
          }
          .bn-item {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 3px; cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
            font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
            color: rgba(255,255,255,0.3); transition: all 0.15s;
            border-top: 2px solid transparent;
            background: none; border-left: none; border-right: none; border-bottom: none;
          }
          .bn-item.active { color: #00ffc8; border-top-color: #00ffc8; background: rgba(0,255,200,0.04); }
          .bn-item:hover:not(.active) { color: rgba(255,255,255,0.6); }
          .bn-icon { font-size: 18px; line-height: 1; }
          .mobile-role-badge {
            position: fixed; top: 12px; right: 12px; z-index: 201;
            background: rgba(0,255,200,0.1); border: 1px solid rgba(0,255,200,0.25);
            padding: 4px 10px; font-family: 'Rajdhani', sans-serif;
            font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
            color: #00ffc8;
          }
        `}</style>

        <div className="mobile-role-badge">
          {isAdmin ? "⚙️ Admin" : role === "scorer" ? "🎯 Scorer" : "👁 Spectator"}
        </div>

        <nav className="bottom-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`bn-item ${active === n.id ? "active" : ""}`}
              onClick={() => onNav(n.id)}
            >
              <span className="bn-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </>
    );
  }

  // ── Desktop sidebar ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');

        .sidebar {
          width: 220px; min-height: 100vh;
          background: #0d0f15;
          border-right: 1px solid rgba(0,255,200,0.07);
          display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
        }

        .sb-logo {
          padding: 26px 22px 20px;
          border-bottom: 1px solid rgba(0,255,200,0.07);
          cursor: default; user-select: none;
          position: relative;
        }
        .sb-logo h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 34px; letter-spacing: 4px; color: #fff; line-height: 1;
        }
        .sb-logo h1 span { color: #00ffc8; }
        .sb-logo p {
          font-family: 'Rajdhani', sans-serif;
          font-size: 9px; letter-spacing: 3px;
          color: rgba(255,255,255,0.2); text-transform: uppercase; margin-top: 3px;
        }
        .sb-tap-hint {
          position: absolute; bottom: -24px; left: 22px;
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          letter-spacing: 2px; color: rgba(0,255,200,0.4); text-transform: uppercase;
          animation: fadeHint 0.3s ease;
        }
        @keyframes fadeHint { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .sb-role {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px; padding: 3px 9px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
        }
        .sb-role.scorer    { background: rgba(0,255,200,0.07);   color: #00ffc8;  border: 1px solid rgba(0,255,200,0.15); }
        .sb-role.spectator { background: rgba(255,184,0,0.07);   color: #ffb800;  border: 1px solid rgba(255,184,0,0.15); }
        .sb-role.admin     { background: rgba(255,100,100,0.07); color: #ff6464;  border: 1px solid rgba(255,100,100,0.2); }

        .sb-nav { padding: 16px 10px; flex: 1; }

        .sb-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 14px; border-radius: 3px; cursor: pointer; margin-bottom: 3px;
          font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.3); transition: all 0.2s;
          border: 1px solid transparent; background: none; width: 100%; text-align: left;
        }
        .sb-nav-item:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.03); }
        .sb-nav-item.active { color: #00ffc8; background: rgba(0,255,200,0.05); border-color: rgba(0,255,200,0.12); }
        .sb-nav-item.admin-item { color: rgba(255,100,100,0.5); }
        .sb-nav-item.admin-item.active { color: #ff6464; background: rgba(255,100,100,0.05); border-color: rgba(255,100,100,0.15); }
        .sb-nav-item.admin-item:hover { color: rgba(255,100,100,0.8); }

        .sb-nav-icon { font-size: 15px; flex-shrink: 0; }

        .sb-user { padding: 14px 14px 18px; border-top: 1px solid rgba(255,255,255,0.05); }
        .sb-user-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .sb-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #00ffc8, #0088ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #000;
          flex-shrink: 0; overflow: hidden;
        }
        .sb-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sb-user-name { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
        .sb-user-rating { font-family: 'Rajdhani', sans-serif; font-size: 10px; color: rgba(0,255,200,0.5); letter-spacing: 1px; }

        .sb-logout {
          width: 100%; padding: 9px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.25); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s; text-align: center;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .sb-logout:hover { color: rgba(255,80,80,0.8); border-color: rgba(255,80,80,0.2); background: rgba(255,80,80,0.04); }
      `}</style>

      <aside className="sidebar">
        {/* Logo — secret admin tap zone */}
        <div className="sb-logo" onClick={handleLogoTap}>
          <h1>Match<span>X</span></h1>
          <p>Badminton Platform</p>
          <div className={`sb-role ${isAdmin ? "admin" : role}`}>
            {isAdmin ? "⚙️ Admin" : role === "scorer" ? "🎯 Scorer" : "👁 Spectator"}
          </div>
          {tapHint && !isAdmin && (
            <div className="sb-tap-hint">Keep tapping...</div>
          )}
        </div>

        {/* Nav items */}
        <nav className="sb-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`sb-nav-item ${active === n.id ? "active" : ""} ${n.id === "admin" ? "admin-item" : ""}`}
              onClick={() => onNav(n.id)}
            >
              <span className="sb-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        {user && (
          <div className="sb-user">
            <div className="sb-user-row">
              <div className="sb-user-avatar">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" />
                  : (user.init || user.name?.slice(0, 2).toUpperCase() || "??")}
              </div>
              <div>
                <div className="sb-user-name">{user.name || "Player"}</div>
                <div className="sb-user-rating">ELO {user.rating || user.elo || 1500}</div>
              </div>
            </div>
            <button className="sb-logout" onClick={onLogout}>↩ Sign Out</button>
          </div>
        )}
      </aside>
    </>
  );
}