/**
 * App.jsx
 * src/App.jsx
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Pages ─────────────────────────────────────────────────────────────────────
import Landing     from "./pages/Landing";
import Dashboard   from "./pages/Dashboard";
import Tournament  from "./pages/Tournament";
import Rankings    from "./pages/Rankings";
import Players     from "./pages/Players";
import Profile     from "./pages/Profile";
import Admin       from "./pages/Admin";
import Setup       from "./pages/Setup";
import MatchScorer from "./pages/MatchScorer";
import SpectatorView from "./pages/SpectatorView"; // live watch view

// ── Sidebar ───────────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";

// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated, loading, user, player, logout, isAdmin } = useAuth();

  const [ready,        setReady]        = useState(false);
  const [page,         setPage]         = useState("dashboard");
  const [activeMatch,  setActiveMatch]  = useState(null);  // match row from DB
  const [activeRole,   setActiveRole]   = useState(null);  // "scorer" | "spectator"

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading || !ready) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

  if (!isAuthenticated) return <Landing />;

  // ── Sidebar user object ───────────────────────────────────────────────────
  const sidebarUser = {
    name:    player?.name  || user?.email?.split("@")[0] || "Player",
    init:    (player?.name || user?.email || "PL").slice(0, 2).toUpperCase(),
    rating:  player?.elo   || 1500,
    isAdmin,
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleNav(id) { setPage(id); }

  async function handleLogout() { await logout(); }

  // ── Setup → Scorer: called by Setup after DB match is created ─────────────
  // matchData = the DB row returned from Supabase after insert
  function handleStartMatch(matchData) {
    setActiveMatch(matchData);
    setActiveRole("scorer");
    setPage("scorer");
  }

  // ── Dashboard card click → spectator view ─────────────────────────────────
  function handleWatchMatch(matchData) {
    setActiveMatch(matchData);
    setActiveRole("spectator");
    setPage("spectator");
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    setActiveRole(null);
    setPage("dashboard");
  }

  // ── Page renderer ─────────────────────────────────────────────────────────
  function renderPage() {
    const sharedProps = { onNav: handleNav, onLogout: handleLogout };

    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            {...sharedProps}
            onWatchMatch={handleWatchMatch}
          />
        );

      case "setup":
        return (
          <Setup
            onStartMatch={handleStartMatch}
            onBack={() => setPage("dashboard")}
          />
        );

      case "scorer":
        // Full-screen — rendered outside sidebar shell below
        return (
          <MatchScorer
            {...sharedProps}
            matchData={activeMatch}       // ← pass the DB row; no second insert
            role="scorer"
            onMatchEnd={handleMatchEnd}
          />
        );

      case "spectator":
        return (
          <SpectatorView
            {...sharedProps}
            matchData={activeMatch}
            onBack={() => setPage("dashboard")}
          />
        );

      case "tournament":
        return <Tournament {...sharedProps} />;

      case "rankings":
        return <Rankings {...sharedProps} />;

      case "players":
        return <Players {...sharedProps} />;

      case "profile":
        return (
          <Profile
            {...sharedProps}
            user={{
              id:    user?.id,
              email: user?.email,
              name:  player?.name || user?.email?.split("@")[0],
            }}
            player={player}
          />
        );

      case "admin":
        if (!isAdmin) { handleNav("dashboard"); return null; }
        return <Admin {...sharedProps} user={user} player={player} />;

      default:
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;
    }
  }

  // ── Full-screen pages — no sidebar ────────────────────────────────────────
  if (page === "scorer") return renderPage();

  // ── Standard layout ───────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080a0f" }}>
      <style>{`
        .sidebar-shell { width: 220px; flex-shrink: 0; }
        .main-shell    { flex: 1; min-height: 100vh; min-width: 0; overflow-x: auto; }

        @media (max-width: 768px) {
          .sidebar-shell { display: none; }
          .main-shell    { padding-bottom: 72px; }
        }
      `}</style>

      <div className="sidebar-shell">
        <Sidebar
          active={page}
          user={sidebarUser}
          onNav={handleNav}
          onLogout={handleLogout}
          role={activeRole || (isAdmin ? "admin" : "spectator")}
        />
      </div>

      <div className="main-shell">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}