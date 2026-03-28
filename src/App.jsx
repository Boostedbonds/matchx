import { useState } from "react";
import Landing from "./pages/Landing";
import Setup from "./pages/Setup";
import MatchScene from "./pages/MatchScene";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Rankings from "./pages/Rankings";
import Tournament from "./pages/Tournament";

function App() {
  const [page, setPage] = useState("landing");
  const [matchData, setMatchData] = useState(null);
  const [user] = useState({
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
  });

  if (page === "landing") return <Landing onStart={() => setPage("dashboard")} />;
  if (page === "setup") return (
    <Setup
      onStartMatch={(data) => { setMatchData(data); setPage("match"); }}
      onBack={() => setPage("dashboard")}
    />
  );
  if (page === "match") return <MatchScene matchData={matchData} onBack={() => setPage("dashboard")} />;
  if (page === "profile") return <Profile user={user} onNav={setPage} />;
  if (page === "rankings") return <Rankings onNav={setPage} />;
  if (page === "tournament") return <Tournament onNav={setPage} />;

  // Dashboard (default)
  return <Dashboard user={user} onNav={setPage} />;
}

export default App;