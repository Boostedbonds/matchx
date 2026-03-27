import { useState } from "react";

function Landing({ onStart }) {
  const [code, setCode] = useState("");

  const handleEnter = () => {
    if (code === "1234") {
      onStart();
    }
  };

  return (
    <div style={styles.container}>
      
      {/* TITLE */}
      <h1 style={styles.title}>🏸 MatchX</h1>

      {/* LOGIN BOX */}
      <div style={styles.box}>
        <input
          style={styles.input}
          placeholder="Enter Access Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button style={styles.button} onClick={handleEnter}>
          Enter
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    position: "absolute",
    top: "30px",
    fontSize: "50px",
    color: "#00ffe5",
    textShadow: "0 0 20px #00ffe5, 0 0 40px #00ffe5",
  },

  box: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },

  input: {
    padding: "12px",
    width: "250px",
    background: "black",
    border: "1px solid #00ffe5",
    color: "#00ffe5",
    outline: "none",
    boxShadow: "0 0 10px #00ffe5",
  },

  button: {
    padding: "12px 30px",
    background: "#00ffe5",
    border: "none",
    color: "black",
    cursor: "pointer",
    boxShadow: "0 0 15px #00ffe5",
  },
};

export default Landing;