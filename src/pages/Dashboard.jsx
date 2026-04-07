import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/supabase";

function Dashboard({ user, onNav, onLogout, liveMatch, onWatchLive }) {
  const [statTab, setStatTab] = useState("performance");
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  const w = user?.wins || 0;
  const l = user?.losses || 0;
  const total = w + l;
  const wr = user?.winRate || 0;
  const pts = user?.points || 0;
  const rating = user?.rating || 1500;
  const streak = user?.streak || 0;

  useEffect(() => {
    fetchPlayers();
    fetchMatches();
  }, []);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("elo", { ascending: false })
      .limit(5);

    if (!error) setPlayers(data || []);
  }

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error) setMatches(data || []);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      
      <Sidebar active="dashboard" user={user} onNav={onNav} onLogout={onLogout} />

      <div className="main">
        <div className="top-bar">
          <h2 className="page-title">Dashboard</h2>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card" style={{"--accent":"#00ffc8"}}>
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{wr}%</div>
          </div>
          <div className="stat-card" style={{"--accent":"#0088ff"}}>
            <div className="stat-label">ELO</div>
            <div className="stat-value">{rating}</div>
          </div>
          <div className="stat-card" style={{"--accent":"#ff3250"}}>
            <div className="stat-label">Streak</div>
            <div className="stat-value">{streak}🔥</div>
          </div>
          <div className="stat-card" style={{"--accent":"#ffb800"}}>
            <div className="stat-label">Points</div>
            <div className="stat-value">{pts}</div>
          </div>
        </div>

        <div className="content-grid">

          {/* LEFT */}
          <div>

            {/* RECENT MATCHES */}
            <div className="card">
              <div className="card-title">Recent Matches</div>

              {matches.length === 0 && (
                <div style={{ opacity: 0.5 }}>No matches yet</div>
              )}

              {matches.map((m, i) => (
                <div className="match-item" key={i}>
                  <div className="match-teams">
                    <div className="match-vs">
                      {m.player1_name || "Player 1"} vs {m.player2_name || "Player 2"}
                    </div>
                    <div className="match-meta">
                      {m.status || "completed"}
                    </div>
                  </div>
                  <div className="match-score">
                    {m.score || "-"}
                  </div>
                </div>
              ))}

              <button className="start-match-btn" onClick={() => onNav("setup")}>
                + Start New Match
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div>

            {/* TOP PLAYERS */}
            <div className="card">
              <div className="card-title">Top Players</div>

              {players.length === 0 && (
                <div style={{ opacity: 0.5 }}>No players yet</div>
              )}

              {players.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0" }}>
                  <div>{i + 1}</div>
                  <div style={{ flex:1 }}>
                    <div>{p.name}</div>
                    <div style={{ fontSize:10, opacity:0.5 }}>{p.club}</div>
                  </div>
                  <div>{p.elo || 1500}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;