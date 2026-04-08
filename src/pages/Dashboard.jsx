import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*");

      if (error) throw error;

      setMatches(data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: "20px", color: "black" }}>
      <h1>Dashboard</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {matches.length === 0 ? (
        <p>No matches found</p>
      ) : (
        matches.map((m) => (
          <div key={m.id}>
            {m.player1_name || "Player 1"} vs {m.player2_name || "Player 2"}
          </div>
        ))
      )}
    </div>
  );
}