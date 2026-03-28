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

const INITIAL_USER = {
  name: "Vishal Kataria",
  club: "Smash FC",
  avatar: "VK",
  rating: 1847,
  points: 3240,
  rank: 12,
  wins: 34,
  losses: 8,
  winRate: 81,
  streak: 5,
  badges: ["🏆 Champion", "🔥 Hot Streak", "⚡ Speed Demon"],
};

function App() {
  const [page, setPage] = useState("landing");
  const [matchData, setMatchData] = useState(null);
  const [user, setUser] = useState(INITIAL_USER);

  const handleLogout = () => {
    setPage("landing");
    setUser(INITIAL_USER);
  };

  // Called after a match ends — update user stats
  const handleMatchComplete = (result) => {
    setUser((prev) => {
      const won = result === "win";
      const newWins = won ? prev.wins + 1 : prev.wins;
      const newLosses = won ? prev.losses : prev.losses + 1;
      const total = newWins + newLosses;
      const newWinRate = Math.round((newWins / total) * 100);
      const newStreak = won ? prev.streak + 1 : 0;
      const pointsGained = won ? 120 : 30;
      const ratingChange = won ? 25 : -15;
      const newPoints = prev.points + pointsGained;
      const newRating = prev.rating + ratingChange;

      // Badge unlocks
      const newBadges = [...prev.badges];
      if (newWins >= 1 && !newBadges.includes("🏅 First Blood")) newBadges.push("🏅 First Blood");
      if (newWins >= 5 && !newBadges.includes("⚡ Speed Demon")) newBadges.push("⚡ Speed Demon");
      if (newStreak >= 3 && !newBadges.includes("🔥 Hot Streak")) newBadges.push("🔥 Hot Streak");
      if (newWins >= 10 && !newBadges.includes("🎯 Sharpshooter")) newBadges.push("🎯 Sharpshooter");
      if (newWins >= 25 && !newBadges.includes("👑 Top 10")) newBadges.push("👑 Top 10");
      if (newPoints >= 5000 && !newBadges.includes("🌟 Rising Star")) newBadges.push("🌟 Rising Star");

      return {
        ...prev,
        wins: newWins,
        losses: newLosses,
        winRate: newWinRate,
        streak: newStreak,
        points: newPoints,
        rating: newRating,
        badges: newBadges,
      };
    });
    setPage("dashboard");
  };

  const navProps = { onNav: setPage, onLogout: handleLogout };

  if (page === "landing") return <Landing onStart={() => setPage("dashboard")} />;
  if (page === "setup") return (
    <Setup
      onStartMatch={(data) => { setMatchData(data); setPage("match"); }}
      onBack={() => setPage("dashboard")}
    />
  );
  if (page === "match") return (
    <MatchScene
      matchData={matchData}
      onBack={() => setPage("dashboard")}
      onMatchComplete={handleMatchComplete}
    />
  );
  if (page === "profile") return <Profile user={user} {...navProps} />;
  if (page === "rankings") return <Rankings {...navProps} />;
  if (page === "tournament") return <Tournament {...navProps} />;
  if (page === "badges") return <Badges user={user} {...navProps} />;
  if (page === "players") return <Players {...navProps} />;

  return <Dashboard user={user} {...navProps} />;
}

export default App;