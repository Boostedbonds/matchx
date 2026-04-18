/**
 * Dashboard.jsx — theme-aware via CSS custom properties
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardStats, subscribeToLiveMatches } from "../services/matchService";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .db-root {
    min-height: 100vh;
    background: var(--mx-bg);
    color: var(--mx-text);
    font-family: 'Rajdhani', sans-serif;
    position: relative;
  }
  .db-root::before {
    content: '';
    position: fixed; inset: 0;
    background: var(--mx-overlay);
    pointer-events: none; z-index: 0;
  }
  .db-inner {
    position: relative; z-index: 1;
    max-width: 1300px; margin: 0 auto;
    padding: 0 24px 80px;
  }

  .db-header {
    padding: 40px 0 32px;
    border-bottom: 1px solid var(--mx-border);
    margin-bottom: 40px;
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .db-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.2em; color: var(--mx-accent); text-transform: uppercase;
    margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .db-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--mx-accent); }
  .db-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 7vw, 80px);
    letter-spacing: 0.04em; line-height: 0.9; margin: 0;
    color: var(--mx-score);
  }
  .db-welcome { margin-top: 10px; font-size: 17px; font-weight: 500; color: var(--mx-text-2); letter-spacing: 0.05em; }
  .db-welcome strong { color: var(--mx-text); font-weight: 700; }

  .db-new-match-btn {
    flex-shrink: 0; display: flex; align-items: center; gap: 8px;
    padding: 14px 24px;
    background: var(--mx-accent);
    color: #020905; font-family: 'Bebas Neue', sans-serif;
    font-size: 17px; letter-spacing: 0.1em;
    border: none; cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s; white-space: nowrap;
  }
  .db-new-match-btn:hover { opacity: 0.88; transform: translateY(-2px); }

  .db-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 40px;
  }
  @media (max-width: 640px) { .db-stats { grid-template-columns: repeat(2, 1fr); } }

  .db-stat {
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    padding: 18px 20px; position: relative; overflow: hidden;
  }
  .db-stat::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 3px; height: 100%; background: var(--mx-stat-before);
  }
  .db-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.18em; color: var(--mx-text-3); text-transform: uppercase; margin-bottom: 6px; }
  .db-stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.05em; color: var(--mx-score); line-height: 1; }

  .db-section { margin-bottom: 40px; }
  .db-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; padding-bottom: 10px;
    border-bottom: 1px solid var(--mx-border);
  }
  .db-section-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 0.08em;
    color: var(--mx-text); margin: 0; display: flex; align-items: center; gap: 10px;
  }
  .live-dot {
    width: 8px; height: 8px; background: var(--mx-accent); border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)} }
  .db-count-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em;
    color: var(--mx-text-3); padding: 4px 10px; border: 1px solid var(--mx-border);
  }

  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

  .db-card {
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden;
    border-radius: 6px;
  }
  .db-card:hover { border-color: var(--mx-border-hover); transform: translateY(-3px); }

  .db-card-top { padding: 14px 18px; border-bottom: 1px solid var(--mx-border); display: flex; align-items: center; justify-content: space-between; }
  .db-card-players { display: flex; align-items: center; gap: 10px; }
  .db-avatar {
    width: 34px; height: 34px;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: var(--mx-score);
    border-radius: 4px;
  }
  .db-vs { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--mx-text-3); }
  .db-badge { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.15em; padding: 3px 8px; text-transform: uppercase; border-radius: 3px; }
  .db-badge.live      { background: var(--mx-badge-live-bg); border: 1px solid var(--mx-badge-live-border); color: var(--mx-badge-live-text); }
  .db-badge.completed { background: var(--mx-surface); border: 1px solid var(--mx-border); color: var(--mx-text-3); }
  .db-badge.default   { background: var(--mx-surface); border: 1px solid var(--mx-border); color: var(--mx-text-3); }

  .db-card-body { padding: 14px 18px; }
  .db-match-name { font-size: 14px; font-weight: 700; color: var(--mx-text); margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .db-match-meta { display: flex; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--mx-text-3); }

  .db-card-foot { padding: 10px 18px; border-top: 1px solid var(--mx-border); }
  .db-view-btn {
    width: 100%; padding: 8px;
    background: transparent; border: 1px solid var(--mx-border);
    color: var(--mx-text-2);
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.15em;
    cursor: pointer; transition: all 0.2s; border-radius: 3px;
  }
  .db-view-btn:hover { background: var(--mx-surface); border-color: var(--mx-border-hover); color: var(--mx-score); }

  .db-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 32px; text-align: center;
    border: 1px solid var(--mx-border); background: var(--mx-surface);
    border-radius: 8px;
  }
  .db-empty-icon { font-size: 52px; margin-bottom: 20px; }
  .db-empty h2 { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.1em; color: var(--mx-text-2); margin: 0 0 8px; }
  .db-empty p  { color: var(--mx-text-3); font-size: 15px; margin: 0 0 28px; }
  .db-create-btn {
    display: flex; align-items: center; gap: 10px; padding: 14px 32px;
    background: var(--mx-accent); color: #020905;
    font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 0.1em;
    border: none; cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: all 0.2s;
  }
  .db-create-btn:hover { opacity: 0.88; transform: translateY(-2px); }

  .db-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 60px; color: var(--mx-text-3); font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; }
  .db-spinner { width: 18px; height: 18px; border: 2px solid var(--mx-border); border-top-color: var(--mx-score); border-radius: 50%; animation: dbspin 0.8s linear infinite; }
  @keyframes dbspin { to { transform: rotate(360deg); } }
`;

function getBadge(status) {
  if (status === "live")      return { label: "LIVE",      cls: "live" };
  if (status === "completed") return { label: "COMPLETED", cls: "completed" };
  return { label: (status || "PENDING").toUpperCase(), cls: "default" };
}

function MatchCard({ match, onWatchMatch }) {
  const badge  = getBadge(match.status);
  const isLive = match.status === "live";
  return (
    <div className="db-card" onClick={() => isLive && onWatchMatch?.(match)}>
      <div className="db-card-top">
        <div className="db-card-players">
          <div className="db-avatar">{(match.player1_name || "P1").slice(0, 2).toUpperCase()}</div>
          <span className="db-vs">VS</span>
          <div className="db-avatar">{(match.player2_name || "P2").slice(0, 2).toUpperCase()}</div>
        </div>
        <span className={`db-badge ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="db-card-body">
        <p className="db-match-name">{match.player1_name || "Player 1"} vs {match.player2_name || "Player 2"}</p>
        <div className="db-match-meta">
          <span>{match.court_name || "Court"}</span>
          {match.started_at && <span>{new Date(match.started_at).toLocaleDateString()}</span>}
          {match.score_a != null && <span style={{ color: "var(--mx-accent)" }}>{match.score_a} – {match.score_b}</span>}
        </div>
      </div>
      <div className="db-card-foot">
        <button className="db-view-btn" type="button">
          {isLive ? "👁 WATCH LIVE →" : "VIEW MATCH →"}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ onNav, onWatchMatch }) {
  const [stats,   setStats]   = useState({ liveNow: 0, totalMatches: 0, completedMatches: 0, season: new Date().getFullYear().toString(), liveMatches: [], recentMatches: [] });
  const [loading, setLoading] = useState(true);
  const { user: authUser, player } = useAuth();
  const displayName = player?.name || authUser?.email?.split("@")[0] || "Player";

  useEffect(() => {
    load();
    const sub = subscribeToLiveMatches((liveMatches) => {
      setStats(prev => ({ ...prev, liveMatches, liveNow: liveMatches.length }));
    });
    return () => sub?.unsubscribe();
  }, []);

  async function load() {
    setLoading(true);
    try { const s = await fetchDashboardStats(); setStats(s); }
    catch (err) { console.error("Dashboard load error:", err); }
    finally { setLoading(false); }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">
        <div className="db-inner">
          <header className="db-header">
            <div>
              <div className="db-eyebrow">Badminton Live Scoring Platform</div>
              <h1 className="db-title">Dashboard</h1>
              <p className="db-welcome">Welcome back, <strong>{displayName}</strong></p>
            </div>
            <button className="db-new-match-btn" type="button" onClick={() => onNav("setup")}>⚡ NEW MATCH</button>
          </header>

          <div className="db-stats">
            <div className="db-stat"><div className="db-stat-label">Live Now</div><div className="db-stat-value">{stats.liveNow}</div></div>
            <div className="db-stat"><div className="db-stat-label">Total Matches</div><div className="db-stat-value">{stats.totalMatches}</div></div>
            <div className="db-stat"><div className="db-stat-label">Completed</div><div className="db-stat-value">{stats.completedMatches}</div></div>
            <div className="db-stat"><div className="db-stat-label">Season</div><div className="db-stat-value">{stats.season}</div></div>
          </div>

          {loading && <div className="db-loading"><div className="db-spinner" />LOADING MATCHES...</div>}

          {!loading && stats.liveMatches.length > 0 && (
            <section className="db-section">
              <div className="db-section-header">
                <h2 className="db-section-title"><span className="live-dot" /> Live Matches</h2>
                <span className="db-count-badge">{stats.liveNow} LIVE</span>
              </div>
              <div className="db-grid">
                {stats.liveMatches.map((m, i) => <MatchCard key={m.id || i} match={m} onWatchMatch={onWatchMatch} />)}
              </div>
            </section>
          )}

          {!loading && stats.recentMatches.length > 0 && (
            <section className="db-section">
              <div className="db-section-header">
                <h2 className="db-section-title">📋 Recent Matches</h2>
                <span className="db-count-badge">{stats.totalMatches} TOTAL</span>
              </div>
              <div className="db-grid">
                {stats.recentMatches.map((m, i) => <MatchCard key={m.id || i} match={m} onWatchMatch={onWatchMatch} />)}
              </div>
            </section>
          )}

          {!loading && stats.liveMatches.length === 0 && stats.recentMatches.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">🏸</div>
              <h2>No Matches Yet</h2>
              <p>Start your first match to see it here.</p>
              <button className="db-create-btn" type="button" onClick={() => onNav("setup")}>⚡ CREATE NEW MATCH</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}