import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching matches:", error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {matches.length === 0 ? (
        <p>No matches available</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="border p-3 rounded">
              <p>
                {match.player1_name} vs {match.player2_name}
              </p>
              <p>Status: {match.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}