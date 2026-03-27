import { useState } from "react";
import Landing from "./pages/Landing";
import Setup from "./pages/Setup";
import MatchScene from "./pages/MatchScene";

function App() {
  const [page, setPage] = useState("landing");
  const [matchData, setMatchData] = useState(null);

  if (page === "landing") {
    return <Landing onStart={() => setPage("setup")} />;
  }

  if (page === "setup") {
    return (
      <Setup
        onStartMatch={(data) => {
          setMatchData(data);
          setPage("match");
        }}
      />
    );
  }

  if (page === "match") {
    return <MatchScene matchData={matchData} />;
  }

  return null;
}

export default App;