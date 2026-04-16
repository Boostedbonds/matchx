/**
 * App.jsx
 * src/App.jsx
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Pages ────────────────────────────────────────────────────────────────────
import Landing     from "./pages/Landing";
import Dashboard   from "./pages/Dashboard";
import Tournament  from "./pages/Tournament";
import Rankings    from "./pages/Rankings";
import Players     from "./pages/Players";
import Profile     from "./pages/Profile";
import Admin       from "./pages/Admin";
import Setup       from "./pages/Setup";
import MatchScorer from "./pages/MatchScorer";

// ── Sidebar ──────────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";

// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated, loading, user, player, logout, isAdmin } = useAuth();

  const [ready,       setReady]       = useState(false);
  const [page,        setPage]        = useState("dashboard");
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeRole,  setActiveRole]  = useState(null); // "scorer" | "spectator" | null

  // Small delay so auth state settles before first paint
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

  // ── Sidebar user object ──────────────────────────────────────────────────
  const sidebarUser = {
    name:    player?.name  || user?.email?.split("@")[0] || "Player",
    init:    (player?.name || user?.email || "PL").slice(0, 2).toUpperCase(),
    rating:  player?.elo   || 1500,
    isAdmin: isAdmin,
  };

  // ── Navigation handler ───────────────────────────────────────────────────
  function handleNav(id) {
    setPage(id);
    // Don't clear activeMatch when navigating — scorer stays alive
  }

  // ── Logout handler ───────────────────────────────────────────────────────
  async function handleLogout() {
    await logout();
    // AuthContext will flip isAuthenticated → false, showing Landing automatically
  }

  // ── Setup → Scorer flow ──────────────────────────────────────────────────
  function handleStartMatch(matchData, role = "scorer") {
    setActiveMatch(matchData);
    setActiveRole(role);
    setPage("scorer");
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    setActiveRole(null);
    setPage("dashboard");
  }

  // ── Render active page ───────────────────────────────────────────────────
  function renderPage() {
    const sharedProps = { onNav: handleNav, onLogout: handleLogout };

    switch (page) {
      case "dashboard":
        return <Dashboard {...sharedProps} />;

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
            // Pass both: Supabase user (for magic-link) and player (for access-code)
            user={{
              id:    user?.id,
              email: user?.email,
              name:  player?.name || user?.email?.split("@")[0],
            }}
            player={player}
          />
        );

      case "admin":
        // Guard: only admins can reach this page
        if (!isAdmin) {
          handleNav("dashboard");
          return null;
        }
        return <Admin {...sharedProps} user={user} player={player} />;

      default:
        return <Dashboard {...sharedProps} />;
    }
  }

  // ── Full-screen pages — no sidebar shell ─────────────────────────────────
  if (page === "scorer") {
    return renderPage();
  }

  // ── Standard layout: sidebar + main content ──────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080a0f" }}>
      <Sidebar
        active={page}
        user={sidebarUser}
        onNav={handleNav}
        onLogout={handleLogout}
        role={activeRole || (isAdmin ? "admin" : "scorer")}
      />

      <div style={{ marginLeft: "220px", flex: 1, minHeight: "100vh" }}>
        <style>{`
          @media (max-width: 768px) {
            .app-main { margin-left: 0 !important; padding-bottom: 72px; }
          }
        `}</style>
        <div className="app-main">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}