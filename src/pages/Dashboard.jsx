import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);

    try {
      const { data: live } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live");

      const { data: recent } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setLiveMatches(live || []);
      setRecentMatches(recent || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  function MatchItem({ match }) {
    return (
      <div
        onClick={() => navigate(`/match/${match.id}`)}
        style={{
          padding: "12px",
          marginBottom: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong>
            {match.player1_name || "Player 1"} vs{" "}
            {match.player2_name || "Player 2"}
          </strong>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {match.created_at
              ? new Date(match.created_at).toLocaleString()
              : ""}
          </div>
        </div>

        <div
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            background:
              match.status === "live" ? "#4caf50" : "#9e9e9e",
            color: "#fff",
          }}
        >
          {match.status || "completed"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h1>Dashboard</h1>

      {loading && <p>Loading...</p>}

      {/* LIVE MATCHES */}
      {!loading && liveMatches.length > 0 && (
        <>
          <h2>🔥 Live Matches</h2>
          {liveMatches.map((m, i) => (
            <MatchItem key={m.id || i} match={m} />
          ))}
        </>
      )}

      {/* RECENT MATCHES */}
      {!loading && liveMatches.length === 0 && recentMatches.length > 0 && (
        <>
          <h2>📜 Recent Matches</h2>
          {recentMatches.map((m, i) => (
            <MatchItem key={m.id || i} match={m} />
          ))}
        </>
      )}

      {/* EMPTY */}
      {!loading &&
        liveMatches.length === 0 &&
        recentMatches.length === 0 && (
          <p>No matches yet. Start one to see it here.</p>
        )}
    </div>
  );
}