import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .setup-root {
    min-height: 100vh;
    background: #030508;
    color: #e8e0d0;
    font-family: 'Rajdhani', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .setup-root::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 15% 10%, rgba(0,255,200,0.05) 0%, transparent 60%),
      radial-gradient(ellipse 60% 60% at 85% 90%, rgba(212,175,55,0.04) 0%, transparent 55%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,255,200,0.02) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,200,0.02) 40px);
    pointer-events: none; z-index: 0;
  }

  .setup-inner {
    position: relative; z-index: 1;
    max-width: 860px; margin: 0 auto;
    padding: 40px 32px 80px;
  }

  /* ── Back ── */
  .setup-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); padding: 0; margin-bottom: 40px;
    transition: color 0.2s;
  }
  .setup-back:hover { color: #00ffc8; }

  /* ── Header ── */
  .setup-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.22em; color: #00ffc8; text-transform: uppercase;
    margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .setup-eyebrow::before {
    content: ''; display: inline-block; width: 20px; height: 1px; background: #00ffc8;
  }
  .setup-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 7vw, 72px);
    letter-spacing: 0.05em; line-height: 0.9; margin: 0 0 32px;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ── Mode toggle ── */
  .mode-toggle {
    display: flex; gap: 0; margin-bottom: 40px;
    border: 1px solid rgba(0,255,200,0.15);
    width: fit-content;
  }
  .mode-btn {
    padding: 12px 28px;
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.1em;
    border: none; cursor: pointer; transition: all 0.2s;
    background: transparent; color: rgba(255,255,255,0.3);
    position: relative;
  }
  .mode-btn.active {
    background: rgba(0,255,200,0.1); color: #00ffc8;
  }
  .mode-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px; background: #00ffc8;
  }
  .mode-btn:not(.active):hover { color: rgba(255,255,255,0.6); }
  .mode-divider { width: 1px; background: rgba(0,255,200,0.15); }

  /* ── Game count ── */
  .game-count-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 40px;
  }
  .game-count-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.18em; color: rgba(255,255,255,0.3); text-transform: uppercase;
  }
  .gc-btn {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5); cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; font-family: 'JetBrains Mono', monospace;
  }
  .gc-btn.active {
    background: rgba(0,255,200,0.1); border-color: rgba(0,255,200,0.4); color: #00ffc8;
  }
  .gc-btn:hover:not(.active) { border-color: rgba(255,255,255,0.2); color: #fff; }

  /* ── Teams grid ── */
  .teams-grid {
    display: grid; grid-template-columns: 1fr 52px 1fr;
    gap: 0; align-items: start; margin-bottom: 40px;
  }

  .team-panel {
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    padding: 28px 24px;
    position: relative;
    transition: border-color 0.3s;
  }
  .team-panel.team-a { border-right: none; }
  .team-panel.team-b { border-left: none; }
  .team-panel.focused { border-color: rgba(0,255,200,0.25); }
  .team-panel.team-a.focused { border-right: none; }
  .team-panel.team-b.focused { border-left: none; }

  .team-vs {
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    align-self: stretch;
  }
  .team-vs-text {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px;
    letter-spacing: 0.08em; color: rgba(255,255,255,0.1);
    writing-mode: vertical-rl;
  }

  .team-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: rgba(0,255,200,0.5);
    text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .team-label-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #00ffc8;
    box-shadow: 0 0 8px #00ffc8;
  }
  .team-label-b { color: rgba(255,184,0,0.6); }
  .team-label-b .team-label-dot { background: #ffb800; box-shadow: 0 0 8px #ffb800; }

  /* Team name input */
  .team-name-input {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.15);
    color: #fff; font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.06em;
    padding: 10px 12px; outline: none;
    transition: all 0.2s; margin-bottom: 16px;
  }
  .team-name-input::placeholder { color: rgba(255,255,255,0.15); }
  .team-name-input:focus {
    border-color: rgba(0,255,200,0.2);
    background: rgba(0,255,200,0.03);
  }

  /* Player inputs */
  .player-row { position: relative; margin-bottom: 10px; }
  .player-row-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: rgba(255,255,255,0.2);
    text-transform: uppercase; margin-bottom: 5px;
  }
  .player-input-wrap { position: relative; }
  .player-input {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid rgba(255,255,255,0.1);
    color: #e8e0d0; font-family: 'Rajdhani', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.05em;
    padding: 8px 0; outline: none; transition: border-color 0.2s;
  }
  .player-input::placeholder { color: rgba(255,255,255,0.2); }
  .player-input:focus { border-color: rgba(0,255,200,0.4); }

  /* Autocomplete dropdown */
  .autocomplete-list {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
    background: #0d1018; border: 1px solid rgba(0,255,200,0.15);
    max-height: 220px; overflow-y: auto;
    box-shadow: 0 12px 40px rgba(0,0,0,0.7);
  }
  .autocomplete-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; cursor: pointer;
    transition: background 0.15s; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .autocomplete-item:last-child { border-bottom: none; }
  .autocomplete-item:hover { background: rgba(0,255,200,0.06); }

  .ac-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    object-fit: cover; border: 1px solid rgba(255,255,255,0.1);
    background: #1a1f2e;
  }
  .ac-avatar-fallback {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,136,255,0.2));
    border: 1px solid rgba(0,255,200,0.2);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 11px; color: #00ffc8;
  }
  .ac-info { flex: 1; min-width: 0; }
  .ac-name {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    color: #e8e0d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ac-meta {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: rgba(255,255,255,0.3); letter-spacing: 0.1em;
  }
  .ac-elo {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: #00ffc8; letter-spacing: 0.08em;
  }

  /* ── Start button ── */
  .start-btn {
    width: 100%; padding: 20px;
    background: linear-gradient(135deg, #00ffc8, #00c87a);
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
  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,255,200,0.35);
  }
  .start-btn:disabled {
    opacity: 0.35; cursor: not-allowed; transform: none;
    box-shadow: none;
  }
  .start-btn:disabled::after { display: none; }

  /* ── Validation hint ── */
  .validation-hint {
    text-align: center; margin-top: 12px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: rgba(255,100,100,0.6); text-transform: uppercase;
  }

  @media (max-width: 640px) {
    .teams-grid { grid-template-columns: 1fr; }
    .team-vs { display: none; }
    .team-panel.team-a { border: 1px solid rgba(255,255,255,0.07); border-bottom: none; }
    .team-panel.team-b { border: 1px solid rgba(255,255,255,0.07); }
    .setup-inner { padding: 24px 16px 60px; }
  }
`;

// ── Preset team names ──────────────────────────────────────────────────────
const TEAM_A_DEFAULTS = ["Team Alpha", "Red Hawks", "Court Kings", "Smash FC"];
const TEAM_B_DEFAULTS = ["Team Beta", "Blue Falcons", "Net Masters", "Rally FC"];

function AutocompleteInput({ placeholder, value, onChange, players, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = value
    ? players.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
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
          onChange={e => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && filtered.length > 0 && (
          <div className="autocomplete-list">
            {filtered.map(p => (
              <div
                key={p.id}
                className="autocomplete-item"
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(p.name);
                  setOpen(false);
                }}
              >
                {p.avatar_url
                  ? <img src={p.avatar_url} className="ac-avatar" alt="" />
                  : <div className="ac-avatar-fallback">{p.name.slice(0,2).toUpperCase()}</div>
                }
                <div className="ac-info">
                  <div className="ac-name">{p.name}</div>
                  <div className="ac-meta">@{p.username || p.name.toLowerCase().replace(/\s/g, "")}</div>
                </div>
                <div className="ac-elo">ELO {p.elo || 1500}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Setup({ onStartMatch, onBack }) {
  const [matchType, setMatchType] = useState("singles"); // singles | doubles
  const [gameCount, setGameCount] = useState(3);
  const [playersDB, setPlayersDB] = useState([]);

  // Team names
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");

  // Players: A1, A2 for doubles; B1, B2 for doubles
  const [players, setPlayers] = useState({ A1: "", A2: "", B1: "", B2: "" });

  const [loading, setLoading] = useState(false);
  const [focusedTeam, setFocusedTeam] = useState(null);

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    const { data } = await supabase.from("players").select("*").order("elo", { ascending: false });
    setPlayersDB(data || []);
  }

  function setPlayer(key, val) {
    setPlayers(p => ({ ...p, [key]: val }));
  }

  async function getOrCreatePlayer(name) {
    if (!name.trim()) return null;
    const { data } = await supabase.from("players").select("*").eq("name", name.trim()).limit(1);
    if (data && data.length > 0) return data[0];

    const username = name.toLowerCase().replace(/\s/g, "") + "_" + Date.now().toString().slice(-4);
    const { data: np } = await supabase.from("players").insert({
      name: name.trim(), username, elo: 1500, wins: 0, losses: 0,
      avatar_url: getRandomAvatar(),
    }).select().single();
    return np;
  }

  // Validation
  const isDoubles = matchType === "doubles";
  const requiredFilled = players.A1.trim() && players.B1.trim() &&
    (!isDoubles || (players.A2.trim() && players.B2.trim()));

  async function createMatch() {
    if (!requiredFilled || loading) return;
    setLoading(true);
    try {
      const p1 = await getOrCreatePlayer(players.A1);
      const p2 = await getOrCreatePlayer(players.B1);
      const p3 = isDoubles ? await getOrCreatePlayer(players.A2) : null;
      const p4 = isDoubles ? await getOrCreatePlayer(players.B2) : null;

      const teamALabel = teamAName || "Team A";
      const teamBLabel = teamBName || "Team B";

      const { data } = await supabase.from("matches").insert({
        player1_id: p1.id,
        player2_id: p2.id,
        player1_name: isDoubles ? `${p1.name} / ${p3?.name}` : p1.name,
        player2_name: isDoubles ? `${p2.name} / ${p4?.name}` : p2.name,
        team_a_name: teamALabel,
        team_b_name: teamBLabel,
        status: "live",
        match_type: matchType,
        game_count: gameCount,
        score_a: 0, score_b: 0,
        ...(isDoubles && { player3_id: p3?.id, player4_id: p4?.id }),
      }).select().single();

      onStartMatch(data);
    } catch (err) {
      console.error("Match creation error:", err);
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

          {/* ── Match type ── */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${matchType === "singles" ? "active" : ""}`}
              onClick={() => setMatchType("singles")}
            >🏸 Singles (1v1)</button>
            <div className="mode-divider" />
            <button
              className={`mode-btn ${matchType === "doubles" ? "active" : ""}`}
              onClick={() => setMatchType("doubles")}
            >👥 Doubles (2v2)</button>
          </div>

          {/* ── Game count ── */}
          <div className="game-count-row">
            <span className="game-count-label">Best of</span>
            {[1, 3, 5].map(n => (
              <button
                key={n}
                className={`gc-btn ${gameCount === n ? "active" : ""}`}
                onClick={() => setGameCount(n)}
              >{n}</button>
            ))}
            <span className="game-count-label" style={{ color: "rgba(255,255,255,0.15)" }}>games</span>
          </div>

          {/* ── Teams ── */}
          <div className="teams-grid">
            {/* TEAM A */}
            <div
              className={`team-panel team-a ${focusedTeam === "A" ? "focused" : ""}`}
              onFocus={() => setFocusedTeam("A")}
              onBlur={() => setFocusedTeam(null)}
            >
              <div className="team-label">
                <div className="team-label-dot" />
                Team A
              </div>
              <input
                className="team-name-input"
                value={teamAName}
                onChange={e => setTeamAName(e.target.value)}
                placeholder={TEAM_A_DEFAULTS[Math.floor(Math.random() * TEAM_A_DEFAULTS.length)]}
              />
              <AutocompleteInput
                placeholder="Player 1 name..."
                value={players.A1}
                onChange={v => setPlayer("A1", v)}
                players={playersDB}
                label={matchType === "doubles" ? "Player 1" : undefined}
              />
              {matchType === "doubles" && (
                <AutocompleteInput
                  placeholder="Player 2 name..."
                  value={players.A2}
                  onChange={v => setPlayer("A2", v)}
                  players={playersDB}
                  label="Player 2"
                />
              )}
            </div>

            {/* VS divider */}
            <div className="team-vs">
              <div className="team-vs-text">VS</div>
            </div>

            {/* TEAM B */}
            <div
              className={`team-panel team-b ${focusedTeam === "B" ? "focused" : ""}`}
              onFocus={() => setFocusedTeam("B")}
              onBlur={() => setFocusedTeam(null)}
            >
              <div className="team-label team-label-b">
                <div className="team-label-dot" />
                Team B
              </div>
              <input
                className="team-name-input"
                value={teamBName}
                onChange={e => setTeamBName(e.target.value)}
                placeholder={TEAM_B_DEFAULTS[Math.floor(Math.random() * TEAM_B_DEFAULTS.length)]}
              />
              <AutocompleteInput
                placeholder="Player 1 name..."
                value={players.B1}
                onChange={v => setPlayer("B1", v)}
                players={playersDB}
                label={matchType === "doubles" ? "Player 1" : undefined}
              />
              {matchType === "doubles" && (
                <AutocompleteInput
                  placeholder="Player 2 name..."
                  value={players.B2}
                  onChange={v => setPlayer("B2", v)}
                  players={playersDB}
                  label="Player 2"
                />
              )}
            </div>
          </div>

          {/* ── Start ── */}
          <button
            className="start-btn"
            onClick={createMatch}
            disabled={!requiredFilled || loading}
          >
            {loading ? "Setting Up Match..." : "⚡ Start Match →"}
          </button>

          {!requiredFilled && (
            <div className="validation-hint">
              {matchType === "doubles"
                ? "Enter all 4 players to continue"
                : "Enter both players to continue"}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ── Utility: random default avatar ────────────────────────────────────────
function getRandomAvatar() {
  const i = Math.floor(Math.random() * 15) + 1;
  return `/avatars/avatar_${String(i).padStart(2, "0")}.png`;
}