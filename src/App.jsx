/**
 * App.jsx
 * src/App.jsx
 *
 * FIXES:
 * 1. loadMatchAndBecomeScorer writes active_scorer_id + clears handoff_token
 *    → triggers old phone's realtime watcher to demote itself to spectator
 * 2. handleForceDemote added → called by MatchScorer when demoted via realtime
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

  // ── FIX 2b: Write active_scorer_id to DB when new scorer takes over ───────
  // This triggers the old phone's realtime listener (in MatchScorer.jsx) which
  // watches active_scorer_id. When it sees a different user id, it auto-demotes.
  // Also clears handoff_token so ScorerHandoff.jsx watcher fires on old phone.
  async function loadMatchAndBecomeScorer(matchId) {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (data && !error) {
      // Claim the scorer seat in DB — old phone's realtime listener will see this
      // and demote itself because active_scorer_id !== their user id
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.id) {
        await supabase
          .from("matches")
          .update({
            active_scorer_id: currentUser.id,  // FIX: new scorer claims seat
            handoff_token:    null,             // FIX: clears token → ScorerHandoff watcher fires
          })
          .eq("id", matchId);
      }

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

  // ── FIX 2b: Called by MatchScorer when active_scorer_id changes away from us
  // The realtime listener in MatchScorer detects we're no longer the active scorer
  // and calls this to cleanly demote us in App state too.
  function handleForceDemote() {
    setShowHandoff(false);   // close handoff panel if open
    updateRole("spectator"); // update auth context role
    // Do NOT navigate away — user stays on match screen as spectator
    // MatchScorer shows the demoted banner and then spectator view
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
              onForceDemote={handleForceDemote}  // FIX 2b: new prop
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