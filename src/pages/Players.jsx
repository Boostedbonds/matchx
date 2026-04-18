import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .pl-root {
    min-height: 100vh; background: var(--mx-bg); color: var(--mx-text);
    font-family: 'Rajdhani', sans-serif; position: relative;
  }
  .pl-root::before {
    content: ''; position: fixed; inset: 0;
    background: var(--mx-overlay); pointer-events: none; z-index: 0;
  }
  .pl-inner {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto; padding: 48px 32px 80px;
  }

  .pl-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    border-bottom: 1px solid var(--mx-border); padding-bottom: 24px; margin-bottom: 32px;
  }
  .pl-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: var(--mx-accent); text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .pl-eyebrow::before { content:''; display:inline-block; width:20px; height:1px; background:var(--mx-accent); }
  .pl-title {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px,6vw,64px);
    letter-spacing: 0.05em; line-height: 0.9; color: var(--mx-score); margin: 0;
  }
  .pl-count {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.15em; color: var(--mx-text-3);
    padding: 6px 14px; border: 1px solid var(--mx-border);
  }

  .pl-search-row {
    display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
  }
  .pl-search {
    flex: 1; min-width: 200px;
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    color: var(--mx-text); font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 600; padding: 10px 16px; outline: none;
    transition: border-color 0.2s;
  }
  .pl-search::placeholder { color: var(--mx-text-3); }
  .pl-search:focus { border-color: var(--mx-accent); }

  .pl-sort-btn {
    padding: 10px 18px; background: var(--mx-bg-card);
    border: 1px solid var(--mx-border); color: var(--mx-text-2);
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .pl-sort-btn.active { border-color: var(--mx-accent); color: var(--mx-accent); background: var(--mx-surface); }
  .pl-sort-btn:hover:not(.active) { border-color: var(--mx-border-hover); color: var(--mx-text); }

  .pl-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;
  }

  .pl-card {
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    padding: 20px; cursor: pointer; transition: all 0.2s; position: relative;
    border-radius: 6px; overflow: hidden;
  }
  .pl-card:hover { border-color: var(--mx-border-hover); transform: translateY(-2px); }
  .pl-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 3px; height: 100%; background: var(--mx-accent); opacity: 0.6;
  }

  .pl-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .pl-avatar {
    width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--mx-accent);
    overflow: hidden;
  }
  .pl-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .pl-card-name {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px;
    letter-spacing: 0.05em; color: var(--mx-text); line-height: 1;
  }
  .pl-card-level {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.12em; color: var(--mx-text-3); text-transform: uppercase; margin-top: 2px;
  }

  .pl-card-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 8px; border-top: 1px solid var(--mx-border); padding-top: 12px;
  }
  .pl-stat { text-align: center; }
  .pl-stat-val {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px;
    letter-spacing: 0.04em; line-height: 1;
  }
  .pl-stat-val.elo   { color: var(--mx-score); }
  .pl-stat-val.wins  { color: var(--mx-accent); }
  .pl-stat-val.loss  { color: #ff6060; }
  .pl-stat-lbl {
    font-family: 'JetBrains Mono', monospace; font-size: 8px;
    letter-spacing: 0.12em; color: var(--mx-text-3); text-transform: uppercase; margin-top: 2px;
  }

  /* ── Player detail panel (click to expand) ── */
  .pl-detail-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .pl-detail-box {
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    border-radius: 8px; padding: 32px; position: relative;
  }
  .pl-detail-close {
    position: absolute; top: 16px; right: 16px;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    color: var(--mx-text-2); width: 32px; height: 32px;
    cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; transition: all 0.2s;
  }
  .pl-detail-close:hover { border-color: var(--mx-border-hover); color: var(--mx-text); }

  .pl-detail-hero { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
  .pl-detail-avatar {
    width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
    background: var(--mx-surface); border: 2px solid var(--mx-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; color: var(--mx-accent); overflow: hidden;
    font-family: 'Bebas Neue', sans-serif; font-size: 26px;
  }
  .pl-detail-avatar img { width:100%; height:100%; object-fit:cover; }
  .pl-detail-name {
    font-family: 'Bebas Neue', sans-serif; font-size: 32px;
    letter-spacing: 0.05em; color: var(--mx-text); line-height: 1; margin-bottom: 4px;
  }
  .pl-detail-elo {
    font-family: 'Bebas Neue', sans-serif; font-size: 42px;
    color: var(--mx-score); line-height: 1;
  }
  .pl-detail-elo-lbl {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.18em; color: var(--mx-text-3); text-transform: uppercase;
  }

  .pl-detail-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin-bottom: 20px;
  }
  .pl-detail-stat {
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    padding: 14px; text-align: center; border-radius: 4px;
  }
  .pl-detail-stat-val {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px;
    color: var(--mx-text); line-height: 1; margin-bottom: 4px;
  }
  .pl-detail-stat-lbl {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.12em; color: var(--mx-text-3); text-transform: uppercase;
  }

  .pl-bar-section { margin-bottom: 20px; }
  .pl-bar-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px;
    letter-spacing: 0.06em; color: var(--mx-text); margin-bottom: 12px;
  }
  .pl-bar-row { display: grid; grid-template-columns: 100px 1fr 36px; gap: 10px; align-items: center; margin-bottom: 8px; }
  .pl-bar-lbl { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: var(--mx-text-3); text-transform: uppercase; }
  .pl-bar-track { height: 5px; background: var(--mx-surface); border-radius: 2px; }
  .pl-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .pl-bar-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--mx-text-3); text-align: right; }

  .pl-match-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--mx-border);
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600;
  }
  .pl-match-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .pl-match-dot.w { background: var(--mx-accent); }
  .pl-match-dot.l { background: #ff6060; }
  .pl-match-opp { flex: 1; color: var(--mx-text); }
  .pl-match-score { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--mx-text-3); }

  .pl-loading {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; gap: 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.15em; color: var(--mx-text-3);
  }
  .pl-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid var(--mx-border); border-top-color: var(--mx-score);
    animation: plspin 0.8s linear infinite;
  }
  @keyframes plspin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .pl-inner { padding: 24px 16px 80px; }
    .pl-grid { grid-template-columns: 1fr; }
  }
`;

function getSkillLevel(elo) {
  if (elo >= 2000) return "Champion";
  if (elo >= 1800) return "Advanced";
  if (elo >= 1600) return "Intermediate";
  if (elo >= 1400) return "Beginner+";
  return "Beginner";
}

function computePlaystyle(p) {
  const total = (p.wins || 0) + (p.losses || 0);
  const elo = p.elo || 1000;
  const wr = total > 0 ? p.wins / total : 0.5;
  return {
    Attack:     Math.min(100, Math.round(50 + wr * 40 + (elo - 1000) / 30)),
    Defense:    Math.min(100, Math.round(40 + (1 - wr) * 30 + total * 0.5)),
    Experience: Math.min(100, Math.round(total * 3)),
    Technique:  Math.min(100, Math.round(40 + (elo - 1000) / 20)),
  };
}

function AvatarDisplay({ avatarUrl, name, size = 48 }) {
  if (avatarUrl?.startsWith("emoji:")) {
    return <div style={{ fontSize: size * 0.55 }}>{avatarUrl.replace("emoji:", "")}</div>;
  }
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return <span style={{ fontFamily: "'Bebas Neue'", fontSize: size * 0.38, color: "var(--mx-accent)" }}>
    {(name || "??").slice(0, 2).toUpperCase()}
  </span>;
}

export default function Players() {
  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sortBy,   setSortBy]   = useState("elo");
  const [selected, setSelected] = useState(null);
  const [history,  setHistory]  = useState([]);

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    const { data } = await supabase
      .from("players").select("*").order("elo", { ascending: false });
    setPlayers(data || []);
    setLoading(false);
  }

  async function openPlayer(p) {
    setSelected(p);
    const { data } = await supabase
      .from("matches")
      .select("*")
      .or(`player1_id.eq.${p.id},player2_id.eq.${p.id}`)
      .order("created_at", { ascending: false })
      .limit(8);
    setHistory(data || []);
  }

  const sorted = [...players]
    .filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "elo")    return (b.elo || 0) - (a.elo || 0);
      if (sortBy === "wins")   return (b.wins || 0) - (a.wins || 0);
      if (sortBy === "name")   return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="pl-root"><div className="pl-loading"><div className="pl-spinner" />LOADING PLAYERS...</div></div>
    </>
  );

  const sel = selected;
  const selTotal = sel ? (sel.wins || 0) + (sel.losses || 0) : 0;
  const selWR = selTotal > 0 ? Math.round((sel.wins / selTotal) * 100) : 0;
  const style = sel ? computePlaystyle(sel) : {};
  const BAR_COLORS = { Attack: "#ff6060", Defense: "var(--mx-accent)", Experience: "#60a5fa", Technique: "#a78bfa" };

  return (
    <>
      <style>{STYLES}</style>
      <div className="pl-root">
        <div className="pl-inner">

          <div className="pl-header">
            <div>
              <div className="pl-eyebrow">Arena</div>
              <h1 className="pl-title">Players</h1>
            </div>
            <div className="pl-count">{players.length} Players</div>
          </div>

          <div className="pl-search-row">
            <input
              className="pl-search"
              placeholder="Search players..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {["elo", "wins", "name"].map(s => (
              <button key={s} className={`pl-sort-btn ${sortBy === s ? "active" : ""}`} onClick={() => setSortBy(s)}>
                {s === "elo" ? "By ELO" : s === "wins" ? "By Wins" : "A–Z"}
              </button>
            ))}
          </div>

          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--mx-text-3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.15em" }}>
              NO PLAYERS FOUND
            </div>
          )}

          <div className="pl-grid">
            {sorted.map((p, i) => {
              const total = (p.wins || 0) + (p.losses || 0);
              const wr = total > 0 ? Math.round((p.wins / total) * 100) : 0;
              return (
                <div key={p.id} className="pl-card" onClick={() => openPlayer(p)}>
                  <div className="pl-card-top">
                    <div className="pl-avatar"><AvatarDisplay avatarUrl={p.avatar_url} name={p.name} size={48} /></div>
                    <div>
                      <div className="pl-card-name">{p.name}</div>
                      <div className="pl-card-level">#{i + 1} · {getSkillLevel(p.elo || 1000)}</div>
                    </div>
                  </div>
                  <div className="pl-card-stats">
                    <div className="pl-stat">
                      <div className="pl-stat-val elo">{p.elo || 1000}</div>
                      <div className="pl-stat-lbl">ELO</div>
                    </div>
                    <div className="pl-stat">
                      <div className="pl-stat-val wins">{p.wins || 0}</div>
                      <div className="pl-stat-lbl">Wins</div>
                    </div>
                    <div className="pl-stat">
                      <div className="pl-stat-val" style={{ color: "var(--mx-text-2)" }}>{wr}%</div>
                      <div className="pl-stat-lbl">Win %</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Player detail panel ── */}
      {sel && (
        <div className="pl-detail-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="pl-detail-box">
            <button className="pl-detail-close" onClick={() => setSelected(null)}>✕</button>

            <div className="pl-detail-hero">
              <div className="pl-detail-avatar"><AvatarDisplay avatarUrl={sel.avatar_url} name={sel.name} size={72} /></div>
              <div style={{ flex: 1 }}>
                <div className="pl-detail-name">{sel.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: "0.12em", padding: "3px 8px", border: "1px solid var(--mx-border)", color: "var(--mx-accent)", background: "var(--mx-surface)", textTransform: "uppercase" }}>
                    {getSkillLevel(sel.elo || 1000)}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="pl-detail-elo">{sel.elo || 1000}</div>
                <div className="pl-detail-elo-lbl">ELO Rating</div>
              </div>
            </div>

            <div className="pl-detail-grid">
              <div className="pl-detail-stat">
                <div className="pl-detail-stat-val" style={{ color: "var(--mx-accent)" }}>{sel.wins || 0}</div>
                <div className="pl-detail-stat-lbl">Wins</div>
              </div>
              <div className="pl-detail-stat">
                <div className="pl-detail-stat-val" style={{ color: "#ff6060" }}>{sel.losses || 0}</div>
                <div className="pl-detail-stat-lbl">Losses</div>
              </div>
              <div className="pl-detail-stat">
                <div className="pl-detail-stat-val" style={{ color: "var(--mx-score)" }}>{selWR}%</div>
                <div className="pl-detail-stat-lbl">Win Rate</div>
              </div>
            </div>

            <div className="pl-bar-section">
              <div className="pl-bar-title">Playstyle</div>
              {Object.entries(style).map(([k, v]) => (
                <div key={k} className="pl-bar-row">
                  <div className="pl-bar-lbl">{k}</div>
                  <div className="pl-bar-track">
                    <div className="pl-bar-fill" style={{ width: `${v}%`, background: BAR_COLORS[k] || "var(--mx-accent)" }} />
                  </div>
                  <div className="pl-bar-num">{v}</div>
                </div>
              ))}
            </div>

            {history.length > 0 && (
              <div>
                <div className="pl-bar-title">Recent Matches</div>
                {history.map((m, i) => {
                  const isP1 = m.player1_id === sel.id;
                  const opp = isP1 ? m.player2_name : m.player1_name;
                  const myS = isP1 ? m.score_a : m.score_b;
                  const opS = isP1 ? m.score_b : m.score_a;
                  const won = myS > opS;
                  return (
                    <div key={i} className="pl-match-row">
                      <div className={`pl-match-dot ${won ? "w" : "l"}`} />
                      <div className="pl-match-opp">{opp || "Unknown"}</div>
                      <div className="pl-match-score">{myS} – {opS}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}