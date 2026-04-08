import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("elo", { ascending: false });

    if (error) {
      console.error("Error fetching players:", error);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-4">Loading players...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Players</h1>

      {players.length === 0 ? (
        <p>No players found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{player.name}</h2>
              <p>ELO: {player.elo}</p>
              <p>Wins: {player.wins}</p>
              <p>Losses: {player.losses}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}