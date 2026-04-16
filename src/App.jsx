/**
 * App.jsx
 * Save to: src/App.jsx
 *
 * Fixed: replaces hardcoded <Dashboard /> with state-based page routing.
 * All sidebar nav items now work. No react-router-dom needed.
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Pages ────────────────────────────────────────────────────────────────────
import Landing      from "./pages/Landing";
import Dashboard    from "./pages/Dashboard";
import Tournament   from "./pages/Tournament";
import Rankings     from "./pages/Rankings";
import Players      from "./pages/Players";
import Profile      from "./pages/Profile";
import Admin        from "./pages/Admin";
import Setup        from "./pages/Setup";
import MatchScorer  from "./pages/MatchScorer";

// ── Sidebar ──────────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";

// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated, loading, user, player, signOut } = useAuth();
  const [ready,       setReady]       = useState(false);
  const [page,        setPage]        = useState("dashboard");
  const [activeMatch, setActiveMatch] = useState(null); // holds match data when scorer is open

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
    name:   player?.name  || user?.email?.split("@")[0] || "Player",
    init:   (player?.name || user?.email || "PL").slice(0, 2).toUpperCase(),
    rating: player?.elo   || 1500,
  };

  // ── Navigation handler ───────────────────────────────────────────────────
  function handleNav(id) {
    setActiveMatch(null); // leave scorer if navigating away
    setPage(id);
  }

  // ── Logout handler ───────────────────────────────────────────────────────
  async function handleLogout() {
    await signOut?.();
    // AuthContext will flip isAuthenticated → false, showing Landing automatically
  }

  // ── Setup → Scorer flow ──────────────────────────────────────────────────
  function handleStartMatch(matchData) {
    setActiveMatch(matchData);
    setPage("scorer");
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    setPage("dashboard");
  }

  // ── Render active page ───────────────────────────────────────────────────
  function renderPage() {
    // Shared props that every page needs
    const sharedProps = { onNav: handleNav, onLogout: handleLogout, user: sidebarUser };

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
            // Profile also needs the raw Supabase user for auth_id checks
            user={{ ...sidebarUser, id: user?.id, email: user?.email }}
          />
        );

      case "admin":
        return <Admin {...sharedProps} user={user} />;

      default:
        return <Dashboard {...sharedProps} />;
    }
  }

  // ── Full-screen pages (scorer / setup) — no sidebar shell ───────────────
  const fullScreenPages = ["scorer"];
  if (fullScreenPages.includes(page)) {
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
      />

      {/* Main content — offset by sidebar width on desktop */}
      <div style={{
        marginLeft: "220px",
        flex: 1,
        minHeight: "100vh",
        // On mobile the Sidebar renders as a bottom bar, so no left margin needed
      }}>
        <style>{`
          @media (max-width: 768px) {
            .app-main { margin-left: 0 !important; }
          }
        `}</style>
        <div className="app-main" style={{ marginLeft: 0 }}>
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