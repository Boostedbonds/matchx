import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

function Setup({ onStartMatch, onBack }) {
  const [matchType, setMatchType] = useState("singles");
  const [gameCount, setGameCount] = useState(3);

  const [playersDB, setPlayersDB] = useState([]);
  const [players, setPlayers] = useState({ A1: "", B1: "" });

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase.from("players").select("*");
    setPlayersDB(data || []);
  }

  const handleChange = (key, value) => {
    setPlayers({ ...players, [key]: value });
  };

  async function getOrCreatePlayer(name) {
    let { data } = await supabase
      .from("players")
      .select("*")
      .eq("name", name)
      .limit(1);

    if (data && data.length > 0) return data[0];

    const username =
      name.toLowerCase().replace(/\s/g, "") +
      "_" +
      Date.now().toString().slice(-4);

    const { data: newPlayer } = await supabase
      .from("players")
      .insert({
        name,
        username,
        elo: 1500,
        wins: 0,
        losses: 0,
        avatar_url: null
      })
      .select()
      .single();

    return newPlayer;
  }

  async function createMatch() {
    const player1 = await getOrCreatePlayer(players.A1);
    const player2 = await getOrCreatePlayer(players.B1);

    const { data } = await supabase
      .from("matches")
      .insert({
        player1_id: player1.id,
        player2_id: player2.id,
        player1_name: player1.name,
        player2_name: player2.name,
        status: "live",
        match_type: matchType,
        game_count: gameCount
      })
      .select()
      .single();

    onStartMatch(data);
  }

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <button onClick={onBack}>← Back</button>

      <h2>Setup Match</h2>

      {/* TEAM A */}
      <h3>Team A</h3>

      <input
        placeholder="Type Player Name"
        value={players.A1}
        onChange={(e) => handleChange("A1", e.target.value)}
      />

      {players.A1 && (
        <div style={{ background: "#111", padding: 10 }}>
          {playersDB
            .filter(p =>
              p.name.toLowerCase().includes(players.A1.toLowerCase())
            )
            .slice(0, 5)
            .map(p => (
              <div
                key={p.id}
                onClick={() => handleChange("A1", p.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: 6
                }}
              >
                <img
                  src={p.avatar_url || "https://via.placeholder.com/30"}
                  style={{ width: 30, height: 30, borderRadius: "50%" }}
                />
                <span>
                  {p.name} (@{p.username})
                </span>
              </div>
            ))}
        </div>
      )}

      {/* TEAM B */}
      <h3>Team B</h3>

      <input
        placeholder="Type Player Name"
        value={players.B1}
        onChange={(e) => handleChange("B1", e.target.value)}
      />

      {players.B1 && (
        <div style={{ background: "#111", padding: 10 }}>
          {playersDB
            .filter(p =>
              p.name.toLowerCase().includes(players.B1.toLowerCase())
            )
            .slice(0, 5)
            .map(p => (
              <div
                key={p.id}
                onClick={() => handleChange("B1", p.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: 6
                }}
              >
                <img
                  src={p.avatar_url || "https://via.placeholder.com/30"}
                  style={{ width: 30, height: 30, borderRadius: "50%" }}
                />
                <span>
                  {p.name} (@{p.username})
                </span>
              </div>
            ))}
        </div>
      )}

      <button onClick={createMatch}>Start Match</button>
    </div>
  );
}

export default Setup;