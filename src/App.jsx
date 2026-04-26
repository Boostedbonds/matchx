/**
 * App.jsx
 * src/App.jsx
 *
 * FIXES:
 * 1. loadMatchAndBecomeScorer now always clears handoff_token regardless of
 *    Supabase Auth session — app uses access codes not Supabase Auth, so
 *    supabase.auth.getUser() returns null and the old if (currentUser?.id)
 *    guard prevented the update from ever running, leaving handoff_token set
 *    in DB forever → ScorerHandoff poll never detected completion → stuck on
 *    "Waiting for new scorer to accept" screen indefinitely.
 * 2. handleForceDemote — called by MatchScorer when demoted via realtime
 * 3. onForceDemote prop passed to MatchScorer
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { supabase } from "./services/supabase";

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

  useEffect(() => {
    if (!isAuthenticated || !ready) return;

    const params = new URLSearchParams(window.location.search);
    const isScorerHandoff = params.get("scorer") === "1";
    const handoffMatchId  = params.get("matchId");

    if (isScorerHandoff && handoffMatchId) {
      window.history.replaceState({}, "", window.location.pathname);
      loadMatchAndBecomeScorer(handoffMatchId);
    }
  }, [isAuthenticated, ready]);

  // FIX: Removed the if (currentUser?.id) guard that was blocking the DB update.
  // The app uses access codes (not Supabase Auth), so supabase.auth.getUser()
  // always returns null. The old guard meant handoff_token was NEVER cleared in
  // the DB, so ScorerHandoff's poll never detected completion and the original
  // device stayed stuck on "Waiting for new scorer to accept..." forever.
  // Now we always clear handoff_token when the new scorer opens the handoff URL.
  async function loadMatchAndBecomeScorer(matchId) {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (data && !error) {
      // Always clear handoff_token — this is what ScorerHandoff polls for.
      // active_scorer_id set to null since we don't have Supabase Auth user ids.
      await supabase
        .from("matches")
        .update({
          handoff_token:    null,
          handoff_scope:    null,
          active_scorer_id: null,
        })
        .eq("id", matchId);

      updateRole("scorer");
      setActiveMatch(data);
      setPage("scorer");
    }
  }

  async function refreshActiveMatch(matchId) {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();
    if (data) setActiveMatch(data);
  }

  if (loading || !ready) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

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

  function handleNav(id) { setPage(id); }
  async function handleLogout() { await logout(); }

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

  function handleHandoffAccepted() {
    setShowHandoff(false);
    updateRole("spectator");
    if (activeMatch?.id) refreshActiveMatch(activeMatch.id);
  }

  function handleForceDemote() {
    setShowHandoff(false);
    updateRole("spectator");
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
        return <Setup onStartMatch={handleStartMatch} onBack={() => setPage("dashboard")} />;
      case "scorer":
        return (
          <>
            <MatchScorer
              {...sharedProps}
              matchData={activeMatch}
              role={role}
              onMatchEnd={handleMatchEnd}
              onHandoff={() => setShowHandoff(true)}
              onForceDemote={handleForceDemote}
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
      case "tournament":  return <Tournament {...sharedProps} />;
      case "rankings":    return <Rankings {...sharedProps} />;
      case "players":     return <Players {...sharedProps} />;
      case "profile":
        return <Profile {...sharedProps} user={{ id: user?.id, email: user?.email }} player={player} />;
      case "admin":
        if (!isAdmin) { handleNav("dashboard"); return null; }
        return <Admin {...sharedProps} user={user} player={player} />;
      default:
        return <Dashboard {...sharedProps} onWatchMatch={handleWatchMatch} />;
    }
  }

  if (page === "scorer") {
    return (
      <>
        {renderPage()}
        {showScorerPrompt && (
          <ScorerPrompt onConfirm={handleConfirmScorer} onDecline={handleDeclineScorer} />
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
      <div style={{ flex: 1, minHeight: "100vh", width: "100%" }}>
        <style>{`
          .app-main-wrap { margin-left: 220px; }
          @media (max-width: 768px) {
            .app-main-wrap {
              margin-left: 0 !important;
              padding-bottom: 72px;
              width: 100%;
              overflow-x: hidden;
            }
          }
        `}</style>
        <div className="app-main-wrap">{renderPage()}</div>
      </div>
      {showScorerPrompt && (
        <ScorerPrompt onConfirm={handleConfirmScorer} onDecline={handleDeclineScorer} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}