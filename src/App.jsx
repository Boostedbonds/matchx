import { useState } from "react";
import Landing       from "./pages/Landing";
import Dashboard     from "./pages/Dashboard";
import RoleSelect    from "./pages/RoleSelect";
import PlayerSelect  from "./pages/PlayerSelect";
import MatchScorer   from "./pages/MatchScorer";
import SpectatorView from "./pages/SpectatorView";
import Tournament    from "./pages/Tournament";
import Rankings      from "./pages/Rankings";
import Players       from "./pages/Players";
import Admin         from "./pages/Admin";

// ─── Demo session user ────────────────────────────────────────────────────────
const DEMO_USER = {
  name:    "Dev Patel",
  init:    "DP",
  club:    "Court Kings",
  rating:  1847,
  wins:    34,
  losses:  8,
  points:  6540,
  winRate: 81,
  streak:  4,
};

// ─── Match flow stages ────────────────────────────────────────────────────────
//
//  null            → no active match, normal navigation
//  "pre"           → RoleSelect   — scorer or spectator?
//  "playerselect"  → PlayerSelect — pick P1 and P2  (scorer only)
//  "scoring"       → MatchScorer  — live scoring controls
//  "watching"      → SpectatorView — read-only live feed
//
// loggedIn persists for the whole session — no re-login between matches.

export default function App() {
  const [loggedIn,   setLoggedIn]   = useState(false);
  const [page,       setPage]       = useState("dashboard");
  const [matchFlow,  setMatchFlow]  = useState(null);
  const [liveMatch,  setLiveMatch]  = useState(null);

  // Selected players carried from PlayerSelect → MatchScorer
  const [matchP1,    setMatchP1]    = useState(null);
  const [matchP2,    setMatchP2]    = useState(null);

  // ── One-time login ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <Landing onStart={() => setLoggedIn(true)} />;
  }

  // ── Stage: Role Select ──────────────────────────────────────────────────────
  if (matchFlow === "pre") {
    return (
      <RoleSelect
        onSelect={(role) => {
          if (role === "scorer") {
            // Scorer goes to player selection first
            setMatchFlow("playerselect");
          } else {
            // Spectator goes straight to live watch
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

  // ── Stage: Player Select (scorer only) ─────────────────────────────────────
  if (matchFlow === "playerselect") {
    return (
      <PlayerSelect
        onStart={(p1, p2) => {
          setMatchP1(p1);
          setMatchP2(p2);
          setMatchFlow("scoring");
          setPage("setup");
        }}
        onCancel={() => {
          // Go back to role select
          setMatchFlow("pre");
        }}
      />
    );
  }

  // ── Stage: Scorer (live controls) ──────────────────────────────────────────
  if (matchFlow === "scoring" && page === "setup") {
    return (
      <MatchScorer
        user={DEMO_USER}
        role="scorer"
        player1={matchP1}
        player2={matchP2}
        onNav={setPage}
        onLogout={() => setLoggedIn(false)}
        onMatchUpdate={(state) => setLiveMatch(state)}
        onMatchEnd={() => {
          setMatchFlow(null);
          setMatchP1(null);
          setMatchP2(null);
          setPage("dashboard");
        }}
      />
    );
  }

  // ── Stage: Spectator (read-only) ────────────────────────────────────────────
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

  // ── Normal app navigation (between matches) ─────────────────────────────────
  function handleNav(p) {
    if (p === "setup") {
      setMatchFlow("pre"); // always go through role select → player select
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