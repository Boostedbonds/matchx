import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Rankings() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  async function fetchRankings() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("elo", { ascending: false });

    if (error) {
      console.error("Error fetching rankings:", error);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-4">Loading rankings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rankings</h1>

      {players.length === 0 ? (
        <p>No players ranked yet</p>
      ) : (
        <div className="space-y-2">
          {players.map((player, index) => (
            <div key={player.id} className="border p-3 rounded">
              #{index + 1} {player.name} — {player.elo} ELO
            </div>
          ))}
        </div>
      )}
    </div>
  );
}