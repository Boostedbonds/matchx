import { useState, useEffect } from "react";

const NAV_SCORER = [
  { id: "dashboard",  label: "Dashboard",  icon: "⚡" },
  { id: "setup",      label: "New Match",  icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "profile",    label: "Profile",    icon: "👤" },
];

const NAV_SPECTATOR = [
  { id: "dashboard",  label: "Matches",   icon: "📡" },
  { id: "rankings",   label: "Rankings",  icon: "📊" },
  { id: "players",    label: "Players",   icon: "👥" },
  { id: "profile",    label: "Profile",   icon: "👤" },
];

const NAV_ADMIN = [
  { id: "dashboard",  label: "Dashboard",  icon: "⚡" },
  { id: "admin",      label: "Admin",      icon: "🔧" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "profile",    label: "Profile",    icon: "👤" },
];

// Render avatar from avatar_url — handles emoji:🦅, full URLs, and null
function SidebarAvatar({ avatarUrl, initials }) {
  if (avatarUrl?.startsWith("emoji:")) {
    const emoji = avatarUrl.replace("emoji:", "");
    return (
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "rgba(0,255,200,0.08)",
        border: "1px solid rgba(0,255,200,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {emoji}
      </div>
    );
  }
  if (avatarUrl) {
    return (
      <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%",
      background: "linear-gradient(135deg, #00ffc8, #0088ff)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "#000", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Sidebar({ active, user, onNav, onLogout, role = "scorer" }) {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [logoTaps,         setLogoTaps]         = useState(0);
  const [tapHint,          setTapHint]          = useState(false);
  const [loggingOut,       setLoggingOut]       = useState(false);

  const isAdmin = role === "admin" || user?.isAdmin ||
    localStorage.getItem("is_admin") === "true";

  const NAV = isAdmin ? NAV_ADMIN
    : role === "spectator" ? NAV_SPECTATOR
    : NAV_SCORER;

  // Secret admin tap — 5 rapid taps on logo
  function handleLogoTap() {
    if (isAdmin) return;
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next === 3) setTapHint(true);
    if (next >= 5) {
      setLogoTaps(0);
      setTapHint(false);
      onNav("admin");
      return;
    }
    setTimeout(() => { setLogoTaps(0); setTapHint(false); }, 2000);
  }

  // Logout with loading state so button gives feedback
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } catch (_) {
      // onLogout should always handle its own errors
    } finally {
      setLoggingOut(false);
    }
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

  // ── Mobile bottom nav ─────────────────────────────────────────────────────
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
          {isAdmin ? "⚙️ Admin" : role === "spectator" ? "👁 Spectator" : "🎯 Scorer"}
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
  const roleLabel = isAdmin ? "⚙️ Admin"
    : role === "spectator" ? "👁 Spectator"
    : "🎯 Scorer";

  const roleClass = isAdmin ? "admin"
    : role === "spectator" ? "spectator"
    : "scorer";

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
          cursor: default; user-select: none; position: relative;
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
          position: absolute; bottom: -22px; left: 22px;
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          letter-spacing: 2px; color: rgba(0,255,200,0.4); text-transform: uppercase;
        }
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
          padding: 11px 14px; cursor: pointer; margin-bottom: 3px;
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
        .sb-logout:hover:not(:disabled) { color: rgba(255,80,80,0.8); border-color: rgba(255,80,80,0.2); background: rgba(255,80,80,0.04); }
        .sb-logout:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <aside className="sidebar">

        {/* Logo — secret admin tap */}
        <div className="sb-logo" onClick={handleLogoTap}>
          <h1>Match<span>X</span></h1>
          <p>Badminton Platform</p>
          <div className={`sb-role ${roleClass}`}>{roleLabel}</div>
          {tapHint && !isAdmin && <div className="sb-tap-hint">Keep tapping...</div>}
        </div>

        {/* Nav */}
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
              <SidebarAvatar
                avatarUrl={user.avatar_url}
                initials={user.init || user.name?.slice(0, 2).toUpperCase() || "??"}
              />
              <div>
                <div className="sb-user-name">{user.name || "Player"}</div>
                <div className="sb-user-rating">ELO {user.rating || user.elo || 1500}</div>
              </div>
            </div>

            <button
              className="sb-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "↩ Signing out..." : "↩ Sign Out"}
            </button>
          </div>
        )}

      </aside>
    </>
  );
}