import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .rk-root {
    min-height: 100vh; background: var(--mx-bg); color: var(--mx-text);
    font-family: 'Rajdhani', sans-serif; position: relative;
  }
  .rk-root::before {
    content: ''; position: fixed; inset: 0;
    background: var(--mx-overlay); pointer-events: none; z-index: 0;
  }
  .rk-inner {
    position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto; padding: 48px 32px 80px;
  }
  .rk-header {
    border-bottom: 1px solid var(--mx-border); padding-bottom: 24px; margin-bottom: 32px;
  }
  .rk-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: var(--mx-accent); text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .rk-eyebrow::before { content:''; display:inline-block; width:20px; height:1px; background:var(--mx-accent); }
  .rk-title {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px,6vw,64px);
    letter-spacing: 0.05em; color: var(--mx-score); margin: 0;
  }

  .rk-table {
    width: 100%; border-collapse: collapse;
  }
  .rk-thead th {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--mx-text-3); padding: 10px 16px;
    border-bottom: 1px solid var(--mx-border); text-align: left; font-weight: 400;
  }
  .rk-thead th.right { text-align: right; }

  .rk-row {
    border-bottom: 1px solid var(--mx-border);
    transition: background 0.15s; cursor: default;
  }
  .rk-row:hover { background: var(--mx-surface); }
  .rk-row.top1 { background: rgba(255,215,0,0.05); }
  .rk-row.top2 { background: rgba(192,192,192,0.04); }
  .rk-row.top3 { background: rgba(205,127,50,0.04); }

  .rk-td { padding: 14px 16px; vertical-align: middle; }
  .rk-td.right { text-align: right; }

  .rk-rank {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px;
    letter-spacing: 0.06em; color: var(--mx-text-3); width: 48px;
  }
  .rk-rank.gold   { color: #ffd700; }
  .rk-rank.silver { color: #c0c0c0; }
  .rk-rank.bronze { color: #cd7f32; }

  .rk-player-cell { display: flex; align-items: center; gap: 12px; }
  .rk-avatar {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 14px; color: var(--mx-accent);
    overflow: hidden;
  }
  .rk-avatar img { width:100%; height:100%; object-fit:cover; }
  .rk-name {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px;
    letter-spacing: 0.04em; color: var(--mx-text);
  }
  .rk-level {
    font-family: 'JetBrains Mono', monospace; font-size: 8px;
    letter-spacing: 0.1em; color: var(--mx-text-3); text-transform: uppercase;
  }

  .rk-elo {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px;
    letter-spacing: 0.04em; color: var(--mx-score);
  }
  .rk-wins {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px;
    color: var(--mx-accent);
  }
  .rk-losses {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #ff6060;
  }
  .rk-wr {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--mx-text-2);
  }

  .rk-medal { font-size: 16px; }

  .rk-loading {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; gap: 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.15em; color: var(--mx-text-3);
  }
  .rk-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid var(--mx-border); border-top-color: var(--mx-score);
    animation: rkspin 0.8s linear infinite;
  }
  @keyframes rkspin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .rk-inner { padding: 24px 16px 80px; }
    .rk-td.hide-mobile { display: none; }
  }
`;

function getSkillLevel(elo) {
  if (elo >= 2000) return "Champion";
  if (elo >= 1800) return "Advanced";
  if (elo >= 1600) return "Intermediate";
  if (elo >= 1400) return "Beginner+";
  return "Beginner";
}

function AvatarCell({ avatarUrl, name }) {
  if (avatarUrl?.startsWith("emoji:")) {
    return <div className="rk-avatar" style={{ fontSize: 20 }}>{avatarUrl.replace("emoji:", "")}</div>;
  }
  if (avatarUrl) {
    return <div className="rk-avatar"><img src={avatarUrl} alt="" /></div>;
  }
  return <div className="rk-avatar">{(name || "??").slice(0, 2).toUpperCase()}</div>;
}

export default function Rankings() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("players").select("*").order("elo", { ascending: false })
      .then(({ data }) => { setPlayers(data || []); setLoading(false); });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const rankClass = (i) => i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "";
  const rankColor = (i) => i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="rk-root"><div className="rk-loading"><div className="rk-spinner" />LOADING RANKINGS...</div></div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="rk-root">
        <div className="rk-inner">
          <div className="rk-header">
            <div className="rk-eyebrow">Season 2026</div>
            <h1 className="rk-title">Rankings</h1>
          </div>

          {players.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--mx-text-3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.15em" }}>
              NO PLAYERS RANKED YET
            </div>
          ) : (
            <table className="rk-table">
              <thead className="rk-thead">
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th>Player</th>
                  <th className="right">ELO</th>
                  <th className="right hide-mobile">Wins</th>
                  <th className="right hide-mobile">Losses</th>
                  <th className="right hide-mobile">Win %</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const total = (p.wins || 0) + (p.losses || 0);
                  const wr = total > 0 ? Math.round((p.wins / total) * 100) : 0;
                  return (
                    <tr key={p.id} className={`rk-row ${rankClass(i)}`}>
                      <td className="rk-td">
                        {i < 3
                          ? <span className="rk-medal">{medals[i]}</span>
                          : <span className={`rk-rank ${rankColor(i)}`}>{i + 1}</span>
                        }
                      </td>
                      <td className="rk-td">
                        <div className="rk-player-cell">
                          <AvatarCell avatarUrl={p.avatar_url} name={p.name} />
                          <div>
                            <div className="rk-name">{p.name}</div>
                            <div className="rk-level">{getSkillLevel(p.elo || 1000)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="rk-td right"><span className="rk-elo">{p.elo || 1000}</span></td>
                      <td className="rk-td right hide-mobile"><span className="rk-wins">{p.wins || 0}</span></td>
                      <td className="rk-td right hide-mobile"><span className="rk-losses">{p.losses || 0}</span></td>
                      <td className="rk-td right hide-mobile"><span className="rk-wr">{wr}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}