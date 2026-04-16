/**
 * App.jsx
 * src/App.jsx
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Landing     from "./pages/Landing";
import Dashboard   from "./pages/Dashboard";
import Tournament  from "./pages/Tournament";
import Rankings    from "./pages/Rankings";
import Players     from "./pages/Players";
import Profile     from "./pages/Profile";
import Admin       from "./pages/Admin";
import Setup       from "./pages/Setup";
import MatchScorer from "./pages/MatchScorer";
import Sidebar     from "./components/Sidebar";

function AppContent() {
  const { isAuthenticated, loading, user, player, logout, isAdmin, role, updateRole } = useAuth();

  const [ready,       setReady]       = useState(false);
  const [page,        setPage]        = useState("dashboard");
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading || !ready) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  const sidebarUser = {
    name:       player?.name       || user?.email?.split("@")[0] || "Player",
    init:       (player?.name      || user?.email || "PL").slice(0, 2).toUpperCase(),
    rating:     player?.elo        || 1500,
    avatar_url: player?.avatar_url || null,
    isAdmin,
  };

  function handleNav(id) {
    setPage(id);
  }

  async function handleLogout() {
    await logout();
  }

  function handleStartMatch(matchData) {
    setActiveMatch(matchData);
    // When starting a match, user becomes scorer
    updateRole("scorer");
    setPage("scorer");
  }

  function handleWatchMatch(matchData) {
    setActiveMatch(matchData);
    // Watching live = spectator
    updateRole("spectator");
    setPage("scorer");
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    setPage("dashboard");
  }

  function renderPage() {
    const sharedProps = { onNav: handleNav, onLogout: handleLogout };

    switch (page) {
      case "dashboard":
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;

      case "setup":
        return (
          <Setup
            onStartMatch={handleStartMatch}
            onBack={() => setPage("dashboard")}
          />
        );

      case "scorer":
        return (
          <MatchScorer
            {...sharedProps}
            matchData={activeMatch}
            role={role}
            onMatchEnd={handleMatchEnd}
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
            user={{ id: user?.id, email: user?.email }}
            player={player}
          />
        );

      case "admin":
        if (!isAdmin) {
          handleNav("dashboard");
          return null;
        }
        return <Admin {...sharedProps} user={user} player={player} />;

      default:
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;
    }
  }

  // Scorer is full-screen, no sidebar
  if (page === "scorer") {
    return renderPage();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080a0f" }}>
      <Sidebar
        active={page}
        user={sidebarUser}
        onNav={handleNav}
        onLogout={handleLogout}
        role={isAdmin ? "admin" : role}
      />

      <div style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
        <style>{`
          @media (max-width: 768px) {
            .app-main { margin-left: 0 !important; padding-bottom: 72px; }
          }
        `}</style>
        <div className="app-main" style={{ marginLeft: 0 }}>
          {renderPage()}
        </div>
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