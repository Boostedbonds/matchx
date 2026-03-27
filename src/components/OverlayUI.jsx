import useMatchStore from "../store/matchStore";

function OverlayUI({ matchData }) {
  const { playerA, playerB, scoreA, scoreB, reset } = useMatchStore();

  return (
    <div style={styles.container}>
      
      {/* TEAM NAMES */}
      <div style={styles.teams}>
        <div>
          <h2>{matchData?.teamA}</h2>
          <p>{matchData?.players.A1} / {matchData?.players.A2}</p>
        </div>

        <div>
          <h2>{matchData?.teamB}</h2>
          <p>{matchData?.players.B1} / {matchData?.players.B2}</p>
        </div>
      </div>

      {/* SCORE */}
      <div style={styles.score}>
        <div>
          <h1>{playerA}</h1>
          <button onClick={scoreA}>+1</button>
        </div>

        <div>
          <h1>{playerB}</h1>
          <button onClick={scoreB}>+1</button>
        </div>
      </div>

      <button style={styles.reset} onClick={reset}>
        Reset
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    top: "10px",
    width: "100%",
    color: "#00ffe5",
    textAlign: "center",
    pointerEvents: "auto",
  },
  teams: {
    display: "flex",
    justifyContent: "space-around",
  },
  score: {
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    marginTop: "20px",
  },
  reset: {
    marginTop: "10px",
    padding: "8px 20px",
    background: "#00ffe5",
    border: "none",
  },
};

export default OverlayUI;