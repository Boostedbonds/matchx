import { useState } from "react";
import Landing from "./pages/Landing";
import Setup from "./pages/Setup";
import MatchScene from "./pages/MatchScene";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Rankings from "./pages/Rankings";
import Tournament from "./pages/Tournament";
import Badges from "./pages/Badges";
import Players from "./pages/Players";
import SpectatorView from "./pages/SpectatorView";
import RoleSelector from "./pages/RoleSelector";
import Admin from "./pages/Admin";

const INITIAL_USER = {
  name: "Shaurya Kataria",
  club: "MatchX",
  avatar: "SK",
  rating: 1500,
  points: 0,
  rank: 99,
  wins: 0,
  losses: 0,
  winRate: 0,
  streak: 0,
  badges: [],
};

function App() {
  const [page, setPage] = useState("landing");
  const [matchData, setMatchData] = useState(null);
  const [user, setUser] = useState(INITIAL_USER);
  const [roleContext, setRoleContext] = useState("match");

  const handleLogout = () => {
    setPage("landing");
    setUser(INITIAL_USER);
  };

  const handleMatchComplete = (result) => {
    setUser((prev) => {
      const won = result === "win";
      const newWins = won ? prev.wins + 1 : prev.wins;
      const newLosses = won ? prev.losses : prev.losses + 1;
      const total = newWins + newLosses;
      const newWinRate = Math.round((newWins / total) * 100);
      const newStreak = won ? prev.streak + 1 : 0;
      const newPoints = prev.points + (won ? 120 : 30);
      const newRating = prev.rating + (won ? 25 : -15);

      return {
        ...prev,
        wins: newWins,
        losses: newLosses,
        winRate: newWinRate,
        streak: newStreak,
        points: newPoints,
        rating: newRating,
      };
    });

    setPage("dashboard");
  };

  const handleNav = (id) => {
    if (id === "setup") {
      setRoleContext("match");
      setPage("role-select");
      return;
    }

    if (id === "spectator") {
      setRoleContext("watch");
      setPage("role-select");
      return;
    }

    setPage(id);
  };

  const navProps = { onNav: handleNav, onLogout: handleLogout };

  if (page === "landing") return <Landing onStart={() => setPage("dashboard")} />;

  if (page === "admin") return <Admin />;

  if (page === "role-select") {
    return (
      <RoleSelector
        context={roleContext}
        onBack={() => setPage("dashboard")}
        onSelectScorer={() => {
          if (roleContext === "match") setPage("setup");
          else setPage("match");
        }}
        onSelectSpectator={() => setPage("spectator")}
      />
    );
  }

  if (page === "setup") {
    return (
      <Setup
        onStartMatch={(data) => {
          setMatchData(data);
          setPage("match");
        }}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "match") {
    return (
      <MatchScene
        matchData={matchData}
        onBack={() => setPage("dashboard")}
        onMatchComplete={handleMatchComplete}
      />
    );
  }

  if (page === "spectator") return <SpectatorView user={user} {...navProps} />;
  if (page === "profile") return <Profile user={user} {...navProps} />;
  if (page === "rankings") return <Rankings {...navProps} />;
  if (page === "tournament") return <Tournament {...navProps} />;
  if (page === "badges") return <Badges user={user} {...navProps} />;
  if (page === "players") return <Players {...navProps} />;

  return <Dashboard user={user} {...navProps} />;
}

export default App;