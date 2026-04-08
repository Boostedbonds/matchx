import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setMatches(data || []);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {matches.length === 0 ? (
        <p>No matches found</p>
      ) : (
        matches.map((m) => (
          <div key={m.id}>
            {m.player1_name} vs {m.player2_name}
          </div>
        ))
      )}
    </div>
  );
}