import { useState, useRef } from "react";
import useMatchStore from "../store/matchStore";
import { startHost, joinViewer } from "../services/webrtc";

function Scoreboard() {
  const { playerA, playerB, winner, scoreA, scoreB, reset } = useMatchStore();

  const [mode, setMode] = useState(null);
  const [nameA, setNameA] = useState("Player A");
  const [nameB, setNameB] = useState("Player B");

  const videoRef = useRef(null);

  const handleHost = async () => {
    setMode("host");
    await startHost(videoRef);
  };

  const handleViewer = async () => {
    setMode("viewer");
    await joinViewer(videoRef);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🏸 MatchX Live</h1>

      {!mode && (
        <div>
          <button onClick={handleHost}>Start Match (Host)</button>
          <button onClick={handleViewer} style={{ marginLeft: "10px" }}>
            Watch Match (Viewer)
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "300px",
          marginTop: "20px",
          border: "2px solid black",
        }}
      />

      <div style={{ marginTop: "20px" }}>
        <input value={nameA} onChange={(e) => setNameA(e.target.value)} />
        <input
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "60px", marginTop: "20px" }}>
        <div>
          <h2>{nameA}</h2>
          <h1>{playerA}</h1>
          <button onClick={scoreA}>+1</button>
        </div>

        <div>
          <h2>{nameB}</h2>
          <h1>{playerB}</h1>
          <button onClick={scoreB}>+1</button>
        </div>
      </div>

      {winner && <h2 style={{ color: "green" }}>{winner}</h2>}

      <button onClick={reset} style={{ marginTop: "20px" }}>
        Reset
      </button>
    </div>
  );
}

export default Scoreboard;