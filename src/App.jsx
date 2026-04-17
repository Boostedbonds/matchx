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
import ScorerPrompt   from "./components/ScorerPrompt";
import ScorerHandoff  from "./components/ScorerHandoff";

function AppContent() {
  const { isAuthenticated, loading, user, player, logout, isAdmin, role, updateRole } = useAuth();

  const [ready,           setReady]           = useState(false);
  const [page,            setPage]            = useState("dashboard");
  const [activeMatch,     setActiveMatch]     = useState(null);
  const [showScorerPrompt, setShowScorerPrompt] = useState(false);
  const [pendingMatch,    setPendingMatch]    = useState(null);   // match waiting for role confirm
  const [showHandoff,     setShowHandoff]     = useState(false);  // QR handoff modal

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

  // ─── Called by Setup when players are selected and Start Match is tapped ───
  // Instead of immediately becoming scorer, show the "become scorer?" prompt
  function handleStartMatch(matchData) {
    setPendingMatch(matchData);
    setShowScorerPrompt(true);
  }

  // ─── User confirmed they want to be scorer ─────────────────────────────────
  function handleConfirmScorer() {
    setShowScorerPrompt(false);
    updateRole("scorer");
    setActiveMatch(pendingMatch);
    setPendingMatch(null);
    setPage("scorer");
  }

  // ─── User declined — enter as spectator ───────────────────────────────────
  function handleDeclineScorer() {
    setShowScorerPrompt(false);
    updateRole("spectator");
    setActiveMatch(pendingMatch);
    setPendingMatch(null);
    setPage("scorer");
  }

  // ─── Called from Dashboard live match tiles ────────────────────────────────
  function handleWatchMatch(matchData) {
    setActiveMatch(matchData);
    updateRole("spectator");
    setPage("scorer");
  }

  // ─── Scorer hands off to another phone via QR ─────────────────────────────
  function handleHandoffAccepted() {
    // The new scorer scanned the QR — this device drops to spectator
    setShowHandoff(false);
    updateRole("spectator");
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    updateRole("spectator"); // ✅ always reset to spectator after match
    setPage("dashboard");
  }

  function renderPage() {
    const sharedProps = { onNav: handleNav, onLogout: handleLogout };

    switch (page) {
      case "dashboard":
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;

      // ✅ THIS WAS MISSING — "New Match" nav item now resolves here
      case "newmatch":
      case "setup":
        return (
          <Setup
            onStartMatch={handleStartMatch}
            onBack={() => setPage("dashboard")}
          />
        );

      case "scorer":
        return (
          <>
            <MatchScorer
              {...sharedProps}
              matchData={activeMatch}
              role={role}
              onMatchEnd={handleMatchEnd}
              onHandoff={() => setShowHandoff(true)}  // scorer can open QR handoff
            />
            {/* QR handoff modal — only visible to current scorer */}
            {showHandoff && role === "scorer" && (
              <ScorerHandoff
                matchId={activeMatch?.id}
                matchData={activeMatch}
                onClose={() => setShowHandoff(false)}
                onHandoffAccepted={handleHandoffAccepted}
              />
            )}
          </>
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
        if (!isAdmin) { handleNav("dashboard"); return null; }
        return <Admin {...sharedProps} user={user} player={player} />;

      default:
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;
    }
  }

  // Scorer page is full-screen — no sidebar
  if (page === "scorer") {
    return (
      <>
        {renderPage()}
        {/* Scorer prompt shown over the scorer page if somehow triggered there */}
        {showScorerPrompt && (
          <ScorerPrompt
            onConfirm={handleConfirmScorer}
            onDecline={handleDeclineScorer}
          />
        )}
      </>
    );
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

      {/* "Become scorer?" modal — shown over the setup/dashboard pages */}
      {showScorerPrompt && (
        <ScorerPrompt
          onConfirm={handleConfirmScorer}
          onDecline={handleDeclineScorer}
        />
      )}
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