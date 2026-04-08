import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function LiveMatch() {
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch();
    subscribeToUpdates();
  }, []);

  async function fetchMatch() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    setMatch(data);
    setLoading(false);
  }

  function subscribeToUpdates() {
    supabase
      .channel("live-match-" + id)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches", filter: `id=eq.${id}` },
        (payload) => {
          setMatch(payload.new);
        }
      )
      .subscribe();
  }

  async function updateScore(player, delta) {
    if (!match) return;

    const field = player === "A" ? "score_a" : "score_b";

    const newScore = (match[field] || 0) + delta;

    await supabase
      .from("matches")
      .update({ [field]: newScore })
      .eq("id", id);
  }

  async function endMatch() {
    await supabase
      .from("matches")
      .update({ status: "completed" })
      .eq("id", id);
  }

  if (loading) return <p>Loading match...</p>;
  if (!match) return <p>Match not found</p>;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Live Match</h2>

      <h3>
        {match.player1_name} vs {match.player2_name}
      </h3>

      <div style={{ display: "flex", justifyContent: "center", gap: 50 }}>
        {/* PLAYER A */}
        <div>
          <h1>{match.score_a || 0}</h1>
          <button onClick={() => updateScore("A", 1)}>+1</button>
          <button onClick={() => updateScore("A", -1)}>-1</button>
        </div>

        {/* PLAYER B */}
        <div>
          <h1>{match.score_b || 0}</h1>
          <button onClick={() => updateScore("B", 1)}>+1</button>
          <button onClick={() => updateScore("B", -1)}>-1</button>
        </div>
      </div>

      <br />

      <button
        onClick={endMatch}
        style={{ padding: 10, background: "red", color: "#fff" }}
      >
        End Match
      </button>
    </div>
  );
}