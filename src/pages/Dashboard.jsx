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

  function MatchCard({ match, isLive = false }) {
    const getStatusBadge = () => {
      const status = match.status || "completed";
      if (status === "live") return { text: "LIVE", class: "badge-live" };
      if (status === "completed") return { text: "COMPLETED", class: "badge-completed" };
      return { text: status.toUpperCase(), class: "badge-default" };
    };

    const badge = getStatusBadge();

    return (
      <div
        className="match-card"
        onClick={() => navigate(`/match/${match.id}`)}
      >
        <div className="match-card-header">
          <div className="match-players">
            <div className="player-badge">
              {(match.player1_name || "P1").slice(0, 2).toUpperCase()}
            </div>
            <span className="vs-text">VS</span>
            <div className="player-badge">
              {(match.player2_name || "P2").slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className={`match-status-badge ${badge.class}`}>
            {badge.text}
          </div>
        </div>

        <div className="match-card-content">
          <h3 className="match-title">
            {match.player1_name || "Player 1"} vs{" "}
            {match.player2_name || "Player 2"}
          </h3>
          <div className="match-meta">
            <span className="match-court">
              {match.court_name || "Court"}
            </span>
            <span className="match-date">
              {match.created_at
                ? new Date(match.created_at).toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>

        <div className="match-card-footer">
          <button className="btn-view">VIEW MATCH</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="header-subtitle">
            Welcome, <span className="user-email">{user?.email}</span>
          </p>
        </div>
      </div>

      {loading && <div className="loading-state">Loading matches...</div>}

      {/* LIVE MATCHES SECTION */}
      {!loading && liveMatches.length > 0 && (
        <section className="matches-section live-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">⚡</span> Live Matches
            </h2>
            <span className="match-count">{liveMatches.length} LIVE</span>
          </div>
          <div className="matches-grid">
            {liveMatches.map((match, i) => (
              <MatchCard key={match.id || i} match={match} isLive={true} />
            ))}
          </div>
        </section>
      )}

      {/* RECENT MATCHES SECTION */}
      {!loading && recentMatches.length > 0 && (
        <section className="matches-section recent-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📋</span> Recent Matches
            </h2>
            <span className="match-count">{recentMatches.length} TOTAL</span>
          </div>
          <div className="matches-grid">
            {recentMatches.map((match, i) => (
              <MatchCard key={match.id || i} match={match} isLive={false} />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {!loading &&
        liveMatches.length === 0 &&
        recentMatches.length === 0 && (
          <section className="empty-state-container">
            <div className="empty-state">
              <div className="empty-icon">🎾</div>
              <h2>No Matches Yet</h2>
              <p>Start your first match to see it here.</p>
              <button
                className="btn-create-match"
                onClick={() => navigate("/match/new")}
              >
                ⚡ CREATE NEW MATCH
              </button>
            </div>
          </section>
        )}
    </div>
  );
}