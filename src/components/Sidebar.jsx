import { useState, useEffect, useRef } from "react";

const NAV_SCORER = [
  { id: "dashboard",  label: "Dashboard",  icon: "⚡" },
  { id: "setup",      label: "New Match",  icon: "🏸" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "profile",    label: "Profile",    icon: "👤" },
];

// ── FIX 2: Added Tournament back to spectator nav ─────────────────────────
const NAV_SPECTATOR = [
  { id: "dashboard",  label: "Matches",    icon: "📡" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "profile",    label: "Profile",    icon: "👤" },
];

const NAV_ADMIN = [
  { id: "dashboard",  label: "Dashboard",  icon: "⚡" },
  { id: "admin",      label: "Admin",      icon: "🔧" },
  { id: "setup",      label: "New Match",  icon: "🏸" },
  { id: "players",    label: "Players",    icon: "👥" },
  { id: "tournament", label: "Tournament", icon: "🏆" },
  { id: "rankings",   label: "Rankings",   icon: "📊" },
  { id: "profile",    label: "Profile",    icon: "👤" },
];

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
  const [isMobile,   setIsMobile]   = useState(false);
  const [logoTaps,   setLogoTaps]   = useState(0);
  const [tapHint,    setTapHint]    = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const tapTimerRef = useRef(null);

  const isAdmin = role === "admin" || user?.isAdmin ||
    localStorage.getItem("is_admin") === "true";

  const NAV = isAdmin ? NAV_ADMIN
    : role === "spectator" ? NAV_SPECTATOR
    : NAV_SCORER;

  function handleLogoTap() {
    if (isAdmin) { onNav("admin"); return; }

    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        clearTimeout(tapTimerRef.current);
        setTapHint(false);
        onNav("admin");
        return 0;
      }
      if (next >= 3) setTapHint(true);
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => {
        setLogoTaps(0);
        setTapHint(false);
      }, 2000);
      return next;
    });
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await onLogout(); } finally { setLoggingOut(false); }
  }

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth <= 768);
    }
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      clearTimeout(tapTimerRef.current);
    };
  }, []);

  const roleLabel = isAdmin ? "⚙️ Admin"
    : role === "spectator" ? "👁 Spectator"
    : "🎯 Scorer";
  const roleClass = isAdmin ? "admin" : role === "spectator" ? "spectator" : "scorer";

  // ── Mobile bottom nav ─────────────────────────────────────────────────────
  if (isMobile) {
    // Show all nav items, max 5 fit comfortably
    const mobileNav = NAV.slice(0, 5);

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap');

          /* FIX 5: Remove all position/width side effects on mobile */
          .bottom-nav {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 60px;
            z-index: 200;
            background: #0d0f15;
            border-top: 1px solid rgba(0,255,200,0.15);
            display: flex;
            align-items: stretch;
            /* No width/margin that could shrink the page */
          }
          .bn-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            cursor: pointer;
            font-family: 'Rajdhani', sans-serif;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.3);
            transition: all 0.15s;
            border: none;
            border-top: 2px solid transparent;
            background: none;
            padding: 0;
            min-width: 0;
          }
          .bn-item.active {
            color: #00ffc8;
            border-top-color: #00ffc8;
            background: rgba(0,255,200,0.04);
          }
          .bn-item:active { opacity: 0.7; }
          .bn-icon { font-size: 16px; line-height: 1; }

          .mobile-role-badge {
            position: fixed;
            top: 10px; right: 10px;
            z-index: 201;
            background: rgba(0,255,200,0.1);
            border: 1px solid rgba(0,255,200,0.25);
            padding: 3px 8px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #00ffc8;
          }
        `}</style>

        <div className="mobile-role-badge">{roleLabel}</div>

        <nav className="bottom-nav" role="navigation">
          {mobileNav.map(n => (
            <button
              key={n.id}
              className={`bn-item${active === n.id ? " active" : ""}`}
              onClick={() => onNav(n.id)}
              type="button"
            >
              <span className="bn-icon">{n.icon}</span>
              <span>{n.label}</span>
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
          cursor: pointer; user-select: none; position: relative;
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
          font-family: 'Rajdhani', sans-serif; font-size: 9px;
          letter-spacing: 2px; color: rgba(0,255,200,0.5);
          text-transform: uppercase; margin-top: 4px;
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

        .sb-nav { padding: 16px 10px; flex: 1; overflow-y: auto; }
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
        .sb-user-name { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; color: #fff; }
        .sb-user-rating { font-family: 'Rajdhani', sans-serif; font-size: 10px; color: rgba(0,255,200,0.5); letter-spacing: 1px; }

        .sb-logout {
          width: 100%; padding: 9px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.25); cursor: pointer;
          font-family: 'Rajdhani', sans-serif; font-size: 11px;
          font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .sb-logout:hover:not(:disabled) { color: rgba(255,80,80,0.8); border-color: rgba(255,80,80,0.2); background: rgba(255,80,80,0.04); }
        .sb-logout:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <aside className="sidebar">
        <div className="sb-logo" onClick={handleLogoTap}>
          <h1>Match<span>X</span></h1>
          <p>Badminton Platform</p>
          <div className={`sb-role ${roleClass}`}>{roleLabel}</div>
          {tapHint && !isAdmin && <div className="sb-tap-hint">Keep tapping... ({5 - logoTaps} more)</div>}
        </div>

        <nav className="sb-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`sb-nav-item${active === n.id ? " active" : ""}${n.id === "admin" ? " admin-item" : ""}`}
              onClick={() => onNav(n.id)}
              type="button"
            >
              <span className="sb-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {user && (
          <div className="sb-user">
            <div className="sb-user-row">
              <SidebarAvatar
                avatarUrl={user.avatar_url}
                initials={user.init || user.name?.slice(0, 2).toUpperCase() || "??"}
              />
              <div>
                <div className="sb-user-name">{user.name || "Player"}</div>
                <div className="sb-user-rating">ELO {user.rating || 1000}</div>
              </div>
            </div>
            <button className="sb-logout" onClick={handleLogout} disabled={loggingOut} type="button">
              {loggingOut ? "↩ Signing out..." : "↩ Sign Out"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}