import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .setup-root {
    min-height: 100vh;
    background: var(--mx-bg);
    color: var(--mx-text);
    font-family: 'Rajdhani', sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  .setup-root::before {
    content: '';
    position: fixed; inset: 0;
    background: var(--mx-overlay);
    pointer-events: none; z-index: 0;
  }
  .setup-inner {
    position: relative; z-index: 1;
    max-width: 860px; margin: 0 auto;
    padding: 40px 32px 80px;
  }

  .setup-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--mx-text-3); padding: 0; margin-bottom: 40px;
    transition: color 0.2s;
  }
  .setup-back:hover { color: var(--mx-accent); }

  .setup-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.22em; color: var(--mx-accent); text-transform: uppercase;
    margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .setup-eyebrow::before {
    content: ''; display: inline-block; width: 20px; height: 1px; background: var(--mx-accent);
  }
  .setup-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 7vw, 72px);
    letter-spacing: 0.05em; line-height: 0.9; margin: 0 0 32px;
    color: var(--mx-score);
  }

  .mode-toggle {
    display: flex; gap: 0; margin-bottom: 40px;
    border: 1px solid var(--mx-border);
    width: fit-content;
  }
  .mode-btn {
    padding: 12px 28px;
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.1em;
    border: none; cursor: pointer; transition: all 0.2s;
    background: transparent; color: var(--mx-text-3);
    position: relative;
  }
  .mode-btn.active {
    background: var(--mx-surface); color: var(--mx-accent);
  }
  .mode-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: var(--mx-accent);
  }
  .mode-btn:not(.active):hover { color: var(--mx-text-2); }
  .mode-divider { width: 1px; background: var(--mx-border); }

  .game-count-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 40px;
  }
  .game-count-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.18em; color: var(--mx-text-3); text-transform: uppercase;
  }
  .gc-btn {
    width: 32px; height: 32px;
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    color: var(--mx-text-2); cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; font-family: 'JetBrains Mono', monospace;
  }
  .gc-btn.active {
    background: var(--mx-surface); border-color: var(--mx-accent-2); color: var(--mx-accent);
  }
  .gc-btn:hover:not(.active) { border-color: var(--mx-border-hover); color: var(--mx-text); }

  .teams-grid {
    display: grid; grid-template-columns: 1fr 52px 1fr;
    gap: 0; align-items: start; margin-bottom: 40px;
  }
  .team-panel {
    border: 1px solid var(--mx-border);
    background: var(--mx-bg-card);
    padding: 28px 24px; position: relative; transition: border-color 0.3s;
  }
  .team-panel.team-a { border-right: none; }
  .team-panel.team-b { border-left: none; }
  .team-panel.focused { border-color: var(--mx-accent-2); }
  .team-panel.team-a.focused { border-right: none; }
  .team-panel.team-b.focused { border-left: none; }

  .team-vs {
    display: flex; align-items: center; justify-content: center;
    background: var(--mx-surface);
    border-top: 1px solid var(--mx-border);
    border-bottom: 1px solid var(--mx-border);
    align-self: stretch;
  }
  .team-vs-text {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px;
    letter-spacing: 0.08em; color: var(--mx-text-3);
    writing-mode: vertical-rl;
  }

  .team-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: var(--mx-accent);
    text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .team-label-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--mx-accent);
  }
  .team-label-b { color: var(--mx-score-2); }
  .team-label-b .team-label-dot { background: var(--mx-score-2); }

  .team-name-input {
    width: 100%; background: var(--mx-surface);
    border: 1px solid var(--mx-border);
    color: var(--mx-text); font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.06em;
    padding: 10px 12px; outline: none;
    transition: all 0.2s; margin-bottom: 16px;
  }
  .team-name-input::placeholder { color: var(--mx-text-3); }
  .team-name-input:focus {
    border-color: var(--mx-accent-2);
    background: var(--mx-bg-card);
  }

  .player-row { position: relative; margin-bottom: 10px; }
  .player-row-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: var(--mx-text-3);
    text-transform: uppercase; margin-bottom: 5px;
  }
  .player-input-wrap { position: relative; }
  .player-input {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid var(--mx-border);
    color: var(--mx-text); font-family: 'Rajdhani', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.05em;
    padding: 8px 0; outline: none; transition: border-color 0.2s;
  }
  .player-input::placeholder { color: var(--mx-text-3); }
  .player-input:focus { border-color: var(--mx-accent); }

  .autocomplete-list {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    max-height: 220px; overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }
  .autocomplete-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; cursor: pointer;
    transition: background 0.15s; border-bottom: 1px solid var(--mx-border);
  }
  .autocomplete-item:last-child { border-bottom: none; }
  .autocomplete-item:hover { background: var(--mx-surface); }
  .ac-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    object-fit: cover; border: 1px solid var(--mx-border);
    background: var(--mx-surface);
  }
  .ac-avatar-fallback {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 11px; color: var(--mx-accent);
  }
  .ac-info { flex: 1; min-width: 0; }
  .ac-name {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    color: var(--mx-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ac-elo {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--mx-accent); letter-spacing: 0.08em;
  }

  .start-btn {
    width: 100%; padding: 20px;
    background: var(--mx-accent);
    color: #020905; border: none; cursor: pointer;
    font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.12em;
    clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .start-btn::after {
    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transition: left 0.5s;
  }
  .start-btn:hover::after { left: 100%; }
  .start-btn:hover { transform: translateY(-2px); opacity: 0.9; }
  .start-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .start-btn:disabled::after { display: none; }

  .validation-hint {
    text-align: center; margin-top: 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: var(--mx-score-2); text-transform: uppercase;
  }
  .setup-error {
    text-align: center; margin-top: 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: rgba(255,80,80,0.9); text-transform: uppercase;
    background: rgba(255,0,0,0.06); border: 1px solid rgba(255,0,0,0.15); padding: 10px 16px;
  }

  @media (max-width: 640px) {
    .teams-grid { grid-template-columns: 1fr; }
    .team-vs { display: none; }
    .team-panel.team-a { border: 1px solid var(--mx-border); border-bottom: none; }
    .team-panel.team-b { border: 1px solid var(--mx-border); }
    .setup-inner { padding: 24px 16px 60px; }
  }
`;

const TEAM_A_DEFAULTS = ["Team Alpha", "Red Hawks", "Court Kings", "Smash FC"];
const TEAM_B_DEFAULTS = ["Team Beta", "Blue Falcons", "Net Masters", "Rally FC"];

function AutocompleteInput({ placeholder, value, onChange, players, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = value
    ? players.filter(p =>
        (p.name || "").toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="player-row" ref={ref}>
      {label && <div className="player-row-label">{label}</div>}
      <div className="player-input-wrap">
        <input
          className="player-input"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {open && filtered.length > 0 && (
          <div className="autocomplete-list">
            {filtered.map(p => (
              <div
                key={p.id}
                className="autocomplete-item"
                onMouseDown={e => { e.preventDefault(); onChange(p.name); setOpen(false); }}
              >
                {p.avatar_url
                  ? <img src={p.avatar_url} className="ac-avatar" alt="" />
                  : <div className="ac-avatar-fallback">{(p.name || "??").slice(0, 2).toUpperCase()}</div>
                }
                <div className="ac-info">
                  <div className="ac-name">{p.name}</div>
                </div>
                <div className="ac-elo">ELO {p.elo || 1000}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Setup({ onStartMatch, onBack }) {
  const [matchType, setMatchType] = useState("singles");
  const [gameCount, setGameCount] = useState(3);
  const [playersDB, setPlayersDB] = useState([]);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [players, setPlayers] = useState({ A1: "", A2: "", B1: "", B2: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedTeam, setFocusedTeam] = useState(null);

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    const { data } = await supabase
      .from("players")
      .select("id, name, elo, avatar_url")
      .order("elo", { ascending: false });
    setPlayersDB(data || []);
  }

  function setPlayer(key, val) {
    setPlayers(p => ({ ...p, [key]: val }));
  }

  async function getOrCreatePlayer(inputName) {
    if (!inputName?.trim()) return null;
    const cleanName = inputName.trim();

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("name", cleanName)
      .limit(1);

    if (error) throw new Error(`Lookup error for "${cleanName}": ${error.message}`);
    if (data && data.length > 0) return data[0];

    const { data: np, error: insertError } = await supabase
      .from("players")
      .insert({ name: cleanName, elo: 1000, wins: 0, losses: 0 })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to create player "${cleanName}": ${insertError.message}`);
    return np;
  }

  const isDoubles = matchType === "doubles";
  const requiredFilled = players.A1.trim() && players.B1.trim() &&
    (!isDoubles || (players.A2.trim() && players.B2.trim()));

  async function createMatch() {
    if (!requiredFilled || loading) return;
    setLoading(true);
    setError(null);

    try {
      const p1 = await getOrCreatePlayer(players.A1);
      const p2 = await getOrCreatePlayer(players.B1);
      const p3 = isDoubles ? await getOrCreatePlayer(players.A2) : null;
      const p4 = isDoubles ? await getOrCreatePlayer(players.B2) : null;

      const { data, error: matchError } = await supabase
        .from("matches")
        .insert({
          player1_id:   p1.id,
          player2_id:   p2.id,
          player1_name: isDoubles ? `${p1.name} / ${p3?.name}` : p1.name,
          player2_name: isDoubles ? `${p2.name} / ${p4?.name}` : p2.name,
          team_a_name:  teamAName || "Team A",
          team_b_name:  teamBName || "Team B",
          status:       "live",
          match_type:   matchType,
          game_count:   gameCount,
          score_a:      0,
          score_b:      0,
          ...(isDoubles && { player3_id: p3?.id, player4_id: p4?.id }),
        })
        .select()
        .single();

      if (matchError) throw new Error(`Match insert failed: ${matchError.message}`);
      if (!data) throw new Error("Match was not returned. Check Supabase RLS policies.");
      onStartMatch(data);
    } catch (err) {
      console.error("Match creation error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="setup-root">
        <div className="setup-inner">
          <button className="setup-back" onClick={onBack}>← Back</button>
          <div className="setup-eyebrow">New Match</div>
          <h1 className="setup-title">Setup Match</h1>

          <div className="mode-toggle">
            <button className={`mode-btn ${matchType === "singles" ? "active" : ""}`} onClick={() => setMatchType("singles")}>
              🏸 Singles (1v1)
            </button>
            <div className="mode-divider" />
            <button className={`mode-btn ${matchType === "doubles" ? "active" : ""}`} onClick={() => setMatchType("doubles")}>
              👥 Doubles (2v2)
            </button>
          </div>

          <div className="game-count-row">
            <span className="game-count-label">Best of</span>
            {[1, 3, 5].map(n => (
              <button key={n} className={`gc-btn ${gameCount === n ? "active" : ""}`} onClick={() => setGameCount(n)}>{n}</button>
            ))}
            <span className="game-count-label" style={{ opacity: 0.4 }}>games</span>
          </div>

          <div className="teams-grid">
            <div
              className={`team-panel team-a ${focusedTeam === "A" ? "focused" : ""}`}
              onFocus={() => setFocusedTeam("A")} onBlur={() => setFocusedTeam(null)}
            >
              <div className="team-label"><div className="team-label-dot" />Team A</div>
              <input className="team-name-input" value={teamAName} onChange={e => setTeamAName(e.target.value)} placeholder="Team A" />
              <AutocompleteInput placeholder="Player 1 name..." value={players.A1} onChange={v => setPlayer("A1", v)} players={playersDB} label={isDoubles ? "Player 1" : undefined} />
              {isDoubles && <AutocompleteInput placeholder="Player 2 name..." value={players.A2} onChange={v => setPlayer("A2", v)} players={playersDB} label="Player 2" />}
            </div>

            <div className="team-vs"><div className="team-vs-text">VS</div></div>

            <div
              className={`team-panel team-b ${focusedTeam === "B" ? "focused" : ""}`}
              onFocus={() => setFocusedTeam("B")} onBlur={() => setFocusedTeam(null)}
            >
              <div className="team-label team-label-b"><div className="team-label-dot" />Team B</div>
              <input className="team-name-input" value={teamBName} onChange={e => setTeamBName(e.target.value)} placeholder="Team B" />
              <AutocompleteInput placeholder="Player 1 name..." value={players.B1} onChange={v => setPlayer("B1", v)} players={playersDB} label={isDoubles ? "Player 1" : undefined} />
              {isDoubles && <AutocompleteInput placeholder="Player 2 name..." value={players.B2} onChange={v => setPlayer("B2", v)} players={playersDB} label="Player 2" />}
            </div>
          </div>

          <button className="start-btn" onClick={createMatch} disabled={!requiredFilled || loading}>
            {loading ? "Setting Up Match..." : "⚡ Start Match →"}
          </button>

          {!requiredFilled && (
            <div className="validation-hint">
              {isDoubles ? "Enter all 4 players to continue" : "Enter both players to continue"}
            </div>
          )}
          {error && <div className="setup-error">⚠ {error}</div>}
        </div>
      </div>
    </>
  );
}