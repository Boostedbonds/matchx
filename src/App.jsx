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

  const [ready,            setReady]            = useState(false);
  const [page,             setPage]             = useState("dashboard");
  const [activeMatch,      setActiveMatch]       = useState(null);
  const [showScorerPrompt, setShowScorerPrompt]  = useState(false);
  const [pendingMatch,     setPendingMatch]      = useState(null);
  const [showHandoff,      setShowHandoff]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  // ── FIX: Check URL for QR scorer handoff token on mount ──────────────────
  // When a new phone scans the QR code, the URL contains ?scorer=1&matchId=xxx
  // We detect this and immediately grant scorer role + load the match
  useEffect(() => {
    if (!isAuthenticated || !ready) return;

    const params = new URLSearchParams(window.location.search);
    const isScorerHandoff = params.get("scorer") === "1";
    const handoffMatchId  = params.get("matchId");

    if (isScorerHandoff && handoffMatchId) {
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);
      // Load match and grant scorer role
      loadMatchAndBecomeScorer(handoffMatchId);
    }
  }, [isAuthenticated, ready]);

  async function loadMatchAndBecomeScorer(matchId) {
    const { supabase } = await import("./services/supabase");
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (data && !error) {
      updateRole("scorer");
      setActiveMatch(data);
      setPage("scorer");
    }
  }

  if (loading || !ready) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

  // ── FIX 1: Show landing page if not authenticated ─────────────────────────
  if (!isAuthenticated) {
    return <Landing />;
  }

  const sidebarUser = {
    name:       player?.name       || user?.email?.split("@")[0] || "Player",
    init:       (player?.name      || user?.email || "PL").slice(0, 2).toUpperCase(),
    rating:     player?.elo        || 1000,
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
    setPendingMatch(matchData);
    setShowScorerPrompt(true);
  }

  function handleConfirmScorer() {
    setShowScorerPrompt(false);
    updateRole("scorer");
    setActiveMatch(pendingMatch);
    setPendingMatch(null);
    setPage("scorer");
  }

  function handleDeclineScorer() {
    setShowScorerPrompt(false);
    updateRole("spectator");
    setActiveMatch(pendingMatch);
    setPendingMatch(null);
    setPage("scorer");
  }

  function handleWatchMatch(matchData) {
    setActiveMatch(matchData);
    updateRole("spectator");
    setPage("scorer");
  }

  // ── FIX 3: Handoff accepted — new scorer takes over, OLD device drops to spectator
  function handleHandoffAccepted() {
    setShowHandoff(false);
    updateRole("spectator");
    // Refresh match data so score is current
    if (activeMatch?.id) {
      refreshActiveMatch(activeMatch.id);
    }
  }

  // ── FIX 4: When new scorer scans QR and takes over, refresh match data ────
  async function refreshActiveMatch(matchId) {
    const { supabase } = await import("./services/supabase");
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();
    if (data) setActiveMatch(data);
  }

  function handleMatchEnd() {
    setActiveMatch(null);
    updateRole("spectator");
    setPage("dashboard");
  }

  function renderPage() {
    const sharedProps = { onNav: handleNav, onLogout: handleLogout };

    switch (page) {
      case "dashboard":
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;

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
              onHandoff={() => setShowHandoff(true)}
            />
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

      {/* FIX 5: marginLeft only on desktop, 0 on mobile (sidebar is bottom nav on mobile) */}
      <div style={{ flex: 1, minHeight: "100vh", width: "100%" }}>
        <style>{`
          .app-main-wrap {
            margin-left: 220px;
          }
          @media (max-width: 768px) {
            .app-main-wrap {
              margin-left: 0 !important;
              padding-bottom: 72px;
              width: 100%;
              overflow-x: hidden;
            }
          }
        `}</style>
        <div className="app-main-wrap">
          {renderPage()}
        </div>
      </div>

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