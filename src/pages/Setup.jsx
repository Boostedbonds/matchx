import { useState } from "react";

function Setup({ onStartMatch }) {
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");

  const [players, setPlayers] = useState({
    A1: "",
    A2: "",
    B1: "",
    B2: "",
  });

  const handleChange = (key, value) => {
    setPlayers({ ...players, [key]: value });
  };

  return (
    <div style={styles.container}>
      
      <h1 style={styles.title}>Setup Match</h1>

      {/* TEAMS SIDE BY SIDE */}
      <div style={styles.row}>

        {/* TEAM A */}
        <div style={styles.team}>
          <input
            style={styles.input}
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Player 1"
            onChange={(e) => handleChange("A1", e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Player 2"
            onChange={(e) => handleChange("A2", e.target.value)}
          />
        </div>

        {/* TEAM B */}
        <div style={styles.team}>
          <input
            style={styles.input}
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Player 1"
            onChange={(e) => handleChange("B1", e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Player 2"
            onChange={(e) => handleChange("B2", e.target.value)}
          />
        </div>

      </div>

      <button
        style={styles.button}
        onClick={() => onStartMatch({ teamA, teamB, players })}
      >
        Start Match
      </button>

    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "black",
    color: "#00ffe5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: "40px",
    marginBottom: "40px",
    textShadow: "0 0 20px #00ffe5",
  },

  row: {
    display: "flex",
    justifyContent: "center",
    gap: "80px", // 🔥 spacing between teams
    width: "80%",
    maxWidth: "900px",
  },

  team: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
  },

  input: {
    padding: "12px",
    background: "black",
    border: "1px solid #00ffe5",
    color: "#00ffe5",
    boxShadow: "0 0 10px #00ffe5",
  },

  button: {
    marginTop: "40px",
    padding: "12px 40px",
    background: "#00ffe5",
    border: "none",
    color: "black",
    cursor: "pointer",
    boxShadow: "0 0 20px #00ffe5",
  },
};

export default Setup;