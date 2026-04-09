import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

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
        className="match-item"
        onClick={() => navigate(`/match/${match.id}`)}
      >
        <div className="match-info">
          <strong className="match-title">
            {match.player1_name || "Player 1"} vs{" "}
            {match.player2_name || "Player 2"}
          </strong>
          <div className="match-date">
            {match.created_at
              ? new Date(match.created_at).toLocaleString()
              : ""}
          </div>
        </div>
        <div className={`match-status ${match.status || "completed"}`}>
          {match.status || "completed"}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          Welcome, <span className="user-email">{user?.email}</span>
        </div>
      </div>

      {loading && <div className="loading">Loading matches...</div>}

      {/* LIVE MATCHES */}
      {!loading && liveMatches.length > 0 && (
        <section className="matches-section">
          <h2 className="section-title">🔥 Live Matches</h2>
          <div className="matches-list">
            {liveMatches.map((m, i) => (
              <MatchItem key={m.id || i} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* RECENT MATCHES */}
      {!loading && liveMatches.length === 0 && recentMatches.length > 0 && (
        <section className="matches-section">
          <h2 className="section-title">📜 Recent Matches</h2>
          <div className="matches-list">
            {recentMatches.map((m, i) => (
              <MatchItem key={m.id || i} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY */}
      {!loading &&
        liveMatches.length === 0 &&
        recentMatches.length === 0 && (
          <div className="empty-state">
            <p>No matches yet. Start one to see it here.</p>
            <button
              className="btn-create-match"
              onClick={() => navigate("/match/new")}
            >
              Create New Match
            </button>
          </div>
        )}
    </div>
  );
}