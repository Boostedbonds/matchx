import { useState } from "react";
import Landing       from "./pages/Landing";
import Dashboard     from "./pages/Dashboard";
import RoleSelect    from "./pages/RoleSelect";
import MatchScorer   from "./pages/MatchScorer";
import SpectatorView from "./pages/SpectatorView";
import Tournament    from "./pages/Tournament";
import Rankings      from "./pages/Rankings";
import Players       from "./pages/Players";
import Admin         from "./pages/Admin";

// ─── Demo session user (replace with real auth later) ─────────────────────
const DEMO_USER = {
  name: "Dev Patel",
  init: "DP",
  club: "Court Kings",
  rating: 1847,
  wins: 34,
  losses: 8,
  points: 6540,
  winRate: 81,
  streak: 4,
};

// ─── Match flow stages ─────────────────────────────────────────────────────
//
//  null       → no active match, normal dashboard navigation
//  "pre"      → RoleSelect screen (who are you for THIS match?)
//  "scoring"  → MatchScorer (scorer's live controls)
//  "watching" → SpectatorView (read-only live feed)
//
// loggedIn persists for the whole session — no re-login between matches.

export default function App() {
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [page,       setPage]       = useState("dashboard");
  const [matchFlow,  setMatchFlow]  = useState(null);
  const [liveMatch,  setLiveMatch]  = useState(null);

  // ── One-time login ────────────────────────────────────────────────────
  if (!loggedIn) {
    return <Landing onStart={() => setLoggedIn(true)} />;
  }

  // ── Role select — fires per match, not per session ────────────────────
  if (matchFlow === "pre") {
    return (
      <RoleSelect
        onSelect={(role) => {
          if (role === "scorer") {
            setMatchFlow("scoring");
            setPage("setup");
          } else {
            setMatchFlow("watching");
            setPage("live");
          }
        }}
        onCancel={() => {
          setMatchFlow(null);
          setPage("dashboard");
        }}
      />
    );
  }

  // ── Active match: scorer ──────────────────────────────────────────────
  if (matchFlow === "scoring" && page === "setup") {
    return (
      <MatchScorer
        user={DEMO_USER}
        role="scorer"
        onNav={setPage}
        onLogout={() => setLoggedIn(false)}
        onMatchUpdate={(state) => setLiveMatch(state)}
        onMatchEnd={() => {
          setMatchFlow(null);
          setPage("dashboard");
        }}
      />
    );
  }

  // ── Active match: spectator ───────────────────────────────────────────
  if (matchFlow === "watching" && page === "live") {
    return (
      <SpectatorView
        match={liveMatch}
        onNav={(p) => {
          setMatchFlow(null);
          setPage(p);
        }}
      />
    );
  }

  // ── Normal app nav (between matches) ─────────────────────────────────
  // "New Match" anywhere in the app → triggers role select for that match
  function handleNav(p) {
    if (p === "setup") {
      setMatchFlow("pre");   // ← role select, not straight to scorer
    } else {
      setPage(p);
    }
  }

  const sharedProps = {
    user:     DEMO_USER,
    onNav:    handleNav,
    onLogout: () => setLoggedIn(false),
  };

  switch (page) {
    case "tournament": return <Tournament {...sharedProps} />;
    case "rankings":   return <Rankings   {...sharedProps} />;
    case "players":    return <Players    {...sharedProps} />;
    case "admin":      return <Admin onBack={() => setPage("dashboard")} />;
    case "dashboard":
    default:
      return (
        <Dashboard
          {...sharedProps}
          liveMatch={liveMatch}
          onWatchLive={() => {
            if (liveMatch) {
              setMatchFlow("watching");
              setPage("live");
            }
          }}
        />
      );
  }
}