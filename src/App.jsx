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

// ─── Match flow stages ────────────────────────────────────────────────────────
//  null            → no active match, normal navigation
//  "pre"           → RoleSelect   — scorer or spectator?
//  "playerselect"  → PlayerSelect — pick P1 and P2 (scorer only)
//  "scoring"       → MatchScorer  — live scoring controls
//  "watching"      → SpectatorView — read-only live feed

export default function App() {
  // loggedInUser is now the real Supabase player row
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [user,      setUser]      = useState(null);

  const [page,      setPage]      = useState("dashboard");
  const [matchFlow, setMatchFlow] = useState(null);
  const [liveMatch, setLiveMatch] = useState(null);
  const [matchP1,   setMatchP1]   = useState(null);
  const [matchP2,   setMatchP2]   = useState(null);

  // ── Login — Landing passes back the real player object ─────────────────────
  if (!loggedIn) {
    return (
      <Landing
        onStart={(player, isNew) => {
          setUser(player);
          setLoggedIn(true);
          // Could show a welcome toast for new players here
        }}
      />
    );
  }

  // ── Role Select ─────────────────────────────────────────────────────────────
  if (matchFlow === "pre") {
    return (
      <RoleSelect
        onSelect={(role) => {
          if (role === "scorer") {
            setMatchFlow("playerselect");
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

  // ── Player Select (scorer only) ─────────────────────────────────────────────
  if (matchFlow === "playerselect") {
    return (
      <PlayerSelect
        onStart={(p1, p2) => {
          setMatchP1(p1);
          setMatchP2(p2);
          setMatchFlow("scoring");
          setPage("setup");
        }}
        onCancel={() => setMatchFlow("pre")}
      />
    );
  }

  // ── Scorer ──────────────────────────────────────────────────────────────────
  if (matchFlow === "scoring" && page === "setup") {
    return (
      <MatchScorer
        user={user}
        role="scorer"
        player1={matchP1}
        player2={matchP2}
        onNav={setPage}
        onLogout={() => { setLoggedIn(false); setUser(null); }}
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

  // ── Spectator ───────────────────────────────────────────────────────────────
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

  // ── Normal navigation ───────────────────────────────────────────────────────
  function handleNav(p) {
    if (p === "setup") {
      setMatchFlow("pre");
    } else {
      setPage(p);
    }
  }

  const sharedProps = {
    user,
    onNav:    handleNav,
    onLogout: () => { setLoggedIn(false); setUser(null); },
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