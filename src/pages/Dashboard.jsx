/**
 * Dashboard.jsx
 * Save to: src/pages/Dashboard.jsx
 * NO TypeScript — works with Vite + plain JSX projects
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchDashboardStats,
  subscribeToLiveMatches,
} from "../services/matchService";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .db-root {
    min-height: 100vh;
    background: #030508;
    color: #e8e0d0;
    font-family: 'Rajdhani', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .db-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 10% 0%, rgba(212,175,55,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 60% at 90% 100%, rgba(0,230,160,0.05) 0%, transparent 55%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(212,175,55,0.03) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(212,175,55,0.03) 40px);
    pointer-events: none;
    z-index: 0;
  }

  .db-inner {
    position: relative;
    z-index: 1;
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 32px 64px;
  }

  .db-header {
    padding: 48px 0 40px;
    border-bottom: 1px solid rgba(212,175,55,0.15);
    margin-bottom: 48px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .db-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: #00e6a0;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #00e6a0;
  }

  .db-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    letter-spacing: 0.04em;
    line-height: 0.9;
    margin: 0;
    background: linear-gradient(135deg, #ffd700 0%, #fff8dc 40%, #d4af37 70%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .db-welcome {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 500;
    color: rgba(232,224,208,0.6);
    letter-spacing: 0.05em;
  }

  .db-welcome strong { color: #e8e0d0; font-weight: 700; }

  .db-new-match-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #00e6a0, #00c87a);
    color: #020905;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 0.1em;
    border: none;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s;
  }

  .db-new-match-btn:hover {
    background: linear-gradient(135deg, #00ffb0, #00e6a0);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,230,160,0.4);
  }

  .db-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 48px;
  }

  .db-stat {
    background: rgba(212,175,55,0.04);
    border: 1px solid rgba(212,175,55,0.12);
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
  }

  .db-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: linear-gradient(to bottom, #d4af37, transparent);
  }

  .db-stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(212,175,55,0.6);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .db-stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 0.05em;
    color: #ffd700;
    line-height: 1;
  }

  .db-section { margin-bottom: 48px; }

  .db-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(212,175,55,0.1);
  }

  .db-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 0.08em;
    color: #e8e0d0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .db-section-title .live-dot {
    width: 8px; height: 8px;
    background: #00e6a0;
    border-radius: 50%;
    box-shadow: 0 0 12px #00e6a0;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .db-count-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(212,175,55,0.5);
    padding: 4px 10px;
    border: 1px solid rgba(212,175,55,0.15);
  }

  .db-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .db-card {
    background: rgba(10,12,18,0.8);
    border: 1px solid rgba(212,175,55,0.12);
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }

  .db-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(212,175,55,0.04), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .db-card:hover {
    border-color: rgba(212,175,55,0.35);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.08);
  }

  .db-card:hover::after { opacity: 1; }

  .db-card-top {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(212,175,55,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .db-card-players {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .db-avatar {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05));
    border: 1px solid rgba(212,175,55,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: #ffd700;
  }

  .db-vs {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(212,175,55,0.4);
    letter-spacing: 0.1em;
  }

  .db-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    padding: 3px 8px;
    text-transform: uppercase;
  }

  .db-badge.live {
    background: rgba(0,230,160,0.12);
    border: 1px solid rgba(0,230,160,0.4);
    color: #00e6a0;
  }

  .db-badge.completed {
    background: rgba(212,175,55,0.06);
    border: 1px solid rgba(212,175,55,0.2);
    color: rgba(212,175,55,0.6);
  }

  .db-badge.default {
    background: rgba(100,100,120,0.1);
    border: 1px solid rgba(100,100,120,0.2);
    color: rgba(200,200,220,0.5);
  }

  .db-card-body { padding: 16px 20px; }

  .db-match-name {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #e8e0d0;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .db-match-meta {
    display: flex;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(232,224,208,0.35);
    letter-spacing: 0.08em;
  }

  .db-card-foot {
    padding: 12px 20px;
    border-top: 1px solid rgba(212,175,55,0.06);
  }

  .db-view-btn {
    width: 100%;
    padding: 8px;
    background: transparent;
    border: 1px solid rgba(212,175,55,0.2);
    color: rgba(212,175,55,0.7);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.2s;
  }

  .db-view-btn:hover {
    background: rgba(212,175,55,0.08);
    border-color: rgba(212,175,55,0.5);
    color: #ffd700;
  }

  .db-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 32px;
    text-align: center;
    border: 1px solid rgba(212,175,55,0.08);
    background: rgba(212,175,55,0.02);
  }

  .db-empty-icon { font-size: 56px; margin-bottom: 24px; }

  .db-empty h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 0.1em;
    color: rgba(212,175,55,0.5);
    margin: 0 0 8px;
  }

  .db-empty p {
    color: rgba(232,224,208,0.35);
    font-size: 15px;
    margin: 0 0 32px;
    letter-spacing: 0.05em;
  }

  .db-create-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    background: linear-gradient(135deg, #00e6a0, #00c87a);
    color: #020905;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 0.1em;
    border: none;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s;
  }

  .db-create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,230,160,0.35);
  }

  .db-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 80px;
    color: rgba(212,175,55,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.15em;
  }

  .db-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(212,175,55,0.15);
    border-top-color: #d4af37;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

function getBadge(status) {
  if (status === "live") return { label: "LIVE", cls: "live" };
  if (status === "completed") return { label: "COMPLETED", cls: "completed" };
  return { label: (status || "PENDING").toUpperCase(), cls: "default" };
}

function MatchCard({ match, onNavigate }) {
  const badge = getBadge(match.status);
  return (
    <div className="db-card" onClick={() => onNavigate(`/match/${match.id}`)}>
      <div className="db-card-top">
        <div className="db-card-players">
          <div className="db-avatar">
            {(match.player1_name || "P1").slice(0, 2).toUpperCase()}
          </div>
          <span className="db-vs">VS</span>
          <div className="db-avatar">
            {(match.player2_name || "P2").slice(0, 2).toUpperCase()}
          </div>
        </div>
        <span className={"db-badge " + badge.cls}>{badge.label}</span>
      </div>

      <div className="db-card-body">
        <p className="db-match-name">
          {match.player1_name || "Player 1"} vs {match.player2_name || "Player 2"}
        </p>
        <div className="db-match-meta">
          <span>{match.court_name || "Court"}</span>
          {match.started_at && (
            <span>{new Date(match.started_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="db-card-foot">
        <button className="db-view-btn">VIEW MATCH →</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    liveNow: 0,
    totalMatches: 0,
    completedMatches: 0,
    season: new Date().getFullYear().toString(),
    liveMatches: [],
    recentMatches: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, player } = useAuth();

  const displayName =
    player?.name || user?.email?.split("@")[0] || "Player";

  useEffect(() => {
    loadDashboardData();

    const subscription = subscribeToLiveMatches((matches) => {
      setStats((prev) => ({
        ...prev,
        liveMatches: matches,
        liveNow: matches.length,
      }));
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">
        <div className="db-inner">

          {/* HEADER */}
          <header className="db-header">
            <div>
              <div className="db-eyebrow">Badminton Live Scoring Platform</div>
              <h1 className="db-title">Dashboard</h1>
              <p className="db-welcome">
                Welcome back, <strong>{displayName}</strong>
              </p>
            </div>
            <button
              className="db-new-match-btn"
              onClick={() => navigate("/match/new")}
            >
              ⚡ NEW MATCH
            </button>
          </header>

          {/* STATS */}
          <div className="db-stats">
            <div className="db-stat">
              <div className="db-stat-label">Live Now</div>
              <div className="db-stat-value">{stats.liveNow}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Total Matches</div>
              <div className="db-stat-value">{stats.totalMatches}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Completed</div>
              <div className="db-stat-value">{stats.completedMatches}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Season</div>
              <div className="db-stat-value">{stats.season}</div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="db-loading">
              <div className="db-spinner" />
              LOADING MATCHES...
            </div>
          )}

          {/* LIVE MATCHES */}
          {!loading && stats.liveMatches.length > 0 && (
            <section className="db-section">
              <div className="db-section-header">
                <h2 className="db-section-title">
                  <span className="live-dot" /> Live Matches
                </h2>
                <span className="db-count-badge">{stats.liveNow} LIVE</span>
              </div>
              <div className="db-grid">
                {stats.liveMatches.map((m, i) => (
                  <MatchCard key={m.id || i} match={m} onNavigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* RECENT MATCHES */}
          {!loading && stats.recentMatches.length > 0 && (
            <section className="db-section">
              <div className="db-section-header">
                <h2 className="db-section-title">📋 Recent Matches</h2>
                <span className="db-count-badge">{stats.totalMatches} TOTAL</span>
              </div>
              <div className="db-grid">
                {stats.recentMatches.map((m, i) => (
                  <MatchCard key={m.id || i} match={m} onNavigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {!loading &&
            stats.liveMatches.length === 0 &&
            stats.recentMatches.length === 0 && (
              <div className="db-empty">
                <div className="db-empty-icon">🏸</div>
                <h2>No Matches Yet</h2>
                <p>Start your first match to see it here.</p>
                <button
                  className="db-create-btn"
                  onClick={() => navigate("/match/new")}
                >
                  ⚡ CREATE NEW MATCH
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
}