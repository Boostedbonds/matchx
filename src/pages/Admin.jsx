/**
 * Admin.jsx
 * src/pages/Admin.jsx
 *
 * Full admin panel with absolute power:
 * - Players: view all, edit name/ELO, delete
 * - Matches: view all live/completed, force-end, delete, reassign scorer
 * - Stats: live counts
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .adm-root {
    min-height: 100vh;
    background: #060709;
    color: #e0d8c8;
    font-family: 'Rajdhani', sans-serif;
  }

  .adm-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    border-bottom: 1px solid rgba(255,60,60,0.2);
    background: rgba(0,0,0,0.6);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(8px);
  }
  .adm-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 0.1em;
    color: #ff3c3c;
  }
  .adm-logo span { color: #ffd700; }
  .adm-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em;
    padding: 4px 10px;
    border: 1px solid rgba(255,60,60,0.4);
    color: rgba(255,60,60,0.8);
    text-transform: uppercase;
  }
  .adm-back {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    padding: 6px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.1em;
    cursor: pointer; transition: all 0.2s;
  }
  .adm-back:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

  .adm-body {
    max-width: 1300px; margin: 0 auto;
    padding: 32px 32px 80px;
  }

  .adm-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 40px;
  }
  @media (max-width: 700px) { .adm-stats { grid-template-columns: repeat(2,1fr); } }

  .adm-stat {
    background: rgba(255,60,60,0.04);
    border: 1px solid rgba(255,60,60,0.15);
    padding: 20px 24px;
  }
  .adm-stat-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px; color: #ff3c3c; line-height: 1;
  }
  .adm-stat-l {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.18em;
    color: rgba(255,255,255,0.3); text-transform: uppercase; margin-top: 4px;
  }

  .adm-tabs {
    display: flex; gap: 0; margin-bottom: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .adm-tab {
    padding: 12px 24px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 0.1em;
    background: transparent; border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer; transition: all 0.2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .adm-tab:hover { color: rgba(255,255,255,0.6); }
  .adm-tab.active { color: #ff3c3c; border-bottom-color: #ff3c3c; }

  .adm-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
  }
  .adm-search {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #e0d8c8; padding: 8px 14px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; outline: none; width: 240px;
    transition: border-color 0.2s;
  }
  .adm-search:focus { border-color: rgba(255,60,60,0.4); }
  .adm-search::placeholder { color: rgba(255,255,255,0.2); }

  .adm-btn {
    padding: 8px 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .adm-btn-red { background: rgba(255,60,60,0.15); border: 1px solid rgba(255,60,60,0.3); color: #ff6060; }
  .adm-btn-red:hover { background: rgba(255,60,60,0.25); color: #ff3c3c; }
  .adm-btn-gold { background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); color: #ffd700; }
  .adm-btn-gold:hover { background: rgba(255,215,0,0.2); }
  .adm-btn-green { background: rgba(0,255,160,0.08); border: 1px solid rgba(0,255,160,0.25); color: #00ffa0; }
  .adm-btn-green:hover { background: rgba(0,255,160,0.15); }
  .adm-btn-sm { padding: 5px 12px; font-size: 9px; }

  .adm-table-wrap { overflow-x: auto; }
  table.adm-table {
    width: 100%; border-collapse: collapse;
    font-size: 14px;
  }
  .adm-table th {
    text-align: left; padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,60,60,0.7);
    border-bottom: 1px solid rgba(255,60,60,0.15);
  }
  .adm-table td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #c8c0b0; vertical-align: middle;
  }
  .adm-table tr:hover td { background: rgba(255,255,255,0.02); }

  .adm-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff; padding: 5px 10px;
    font-family: 'Rajdhani', sans-serif; font-size: 14px;
    outline: none; width: 100%;
  }
  .adm-input:focus { border-color: rgba(255,215,0,0.5); }

  .adm-status-live {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: #00ffa0;
    padding: 3px 8px; border: 1px solid rgba(0,255,160,0.25);
    background: rgba(0,255,160,0.06);
  }
  .adm-status-live::before {
    content: ''; width: 5px; height: 5px; border-radius: 50%;
    background: #00ffa0;
  }
  .adm-status-done {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: rgba(255,255,255,0.25);
    padding: 3px 8px; border: 1px solid rgba(255,255,255,0.08);
  }

  .adm-empty {
    text-align: center; padding: 60px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.15em;
    color: rgba(255,255,255,0.2); text-transform: uppercase;
  }

  .adm-modal-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .adm-modal {
    background: #0c0e14;
    border: 1px solid rgba(255,60,60,0.3);
    padding: 32px; max-width: 460px; width: 100%;
  }
  .adm-modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px; letter-spacing: 0.06em;
    color: #ff3c3c; margin-bottom: 20px;
  }
  .adm-field { margin-bottom: 16px; }
  .adm-field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255,255,255,0.35); margin-bottom: 6px; display: block;
  }
  .adm-modal-actions { display: flex; gap: 10px; margin-top: 24px; }

  .adm-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    padding: 12px 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    border-left: 3px solid #00ffa0;
    background: rgba(0,20,10,0.95);
    color: #00ffa0; animation: adm-slide-in 0.3s ease;
  }
  .adm-toast.error { border-left-color: #ff3c3c; background: rgba(20,0,0,0.95); color: #ff6060; }
  @keyframes adm-slide-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .adm-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,60,60,0.2);
    border-top-color: #ff3c3c; border-radius: 50%;
    animation: adm-spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes adm-spin { to { transform: rotate(360deg); } }

  .adm-confirm-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.9);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .adm-confirm {
    background: #0c0e14; border: 1px solid rgba(255,60,60,0.4);
    padding: 32px; max-width: 380px; width: 100%; text-align: center;
  }
  .adm-confirm-icon { font-size: 40px; margin-bottom: 12px; }
  .adm-confirm-msg {
    font-size: 16px; font-weight: 600; color: #e0d8c8; margin-bottom: 8px;
  }
  .adm-confirm-sub {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: rgba(255,255,255,0.3); letter-spacing: 0.1em; margin-bottom: 24px;
  }
  .adm-confirm-btns { display: flex; gap: 10px; justify-content: center; }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return <div className={`adm-toast ${type === "error" ? "error" : ""}`}>{message}</div>;
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function Confirm({ message, sub, onConfirm, onCancel }) {
  return (
    <div className="adm-confirm-overlay">
      <div className="adm-confirm">
        <div className="adm-confirm-icon">⚠️</div>
        <div className="adm-confirm-msg">{message}</div>
        {sub && <div className="adm-confirm-sub">{sub}</div>}
        <div className="adm-confirm-btns">
          <button className="adm-btn adm-btn-red" onClick={onConfirm}>Confirm</button>
          <button className="adm-btn" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", background: "transparent" }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Players Tab ───────────────────────────────────────────────────────────────
function PlayersTab({ toast, confirm }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState(null); // {id, name, elo, wins, losses}
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("players")
      .select("id, name, elo, wins, losses, matches_played, created_at")
      .order("elo", { ascending: false });
    setPlayers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = players.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("players")
      .update({
        name:   editing.name,
        elo:    Number(editing.elo),
        wins:   Number(editing.wins),
        losses: Number(editing.losses),
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast("Save failed: " + error.message, "error"); return; }
    toast("Player updated ✓");
    setEditing(null);
    load();
  }

  function handleDelete(p) {
    confirm(
      `Delete "${p.name}"?`,
      "This cannot be undone. All match references remain.",
      async () => {
        const { error } = await supabase.from("players").delete().eq("id", p.id);
        if (error) { toast("Delete failed: " + error.message, "error"); return; }
        toast("Player deleted ✓");
        load();
      }
    );
  }

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
          {filtered.length} PLAYERS
        </span>
      </div>

      {loading ? (
        <div className="adm-empty"><div className="adm-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No players found</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>ELO</th>
                <th>W</th>
                <th>L</th>
                <th>Matches</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{i + 1}</td>
                  <td style={{ fontWeight: 700, color: "#e0d8c8" }}>{p.name}</td>
                  <td style={{ color: "#ffd700", fontFamily: "JetBrains Mono, monospace" }}>{p.elo || 1000}</td>
                  <td style={{ color: "#00ffa0" }}>{p.wins || 0}</td>
                  <td style={{ color: "#ff6060" }}>{p.losses || 0}</td>
                  <td style={{ color: "rgba(255,255,255,0.4)" }}>{p.matches_played || 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="adm-btn adm-btn-gold adm-btn-sm" onClick={() => setEditing({ ...p })}>Edit</button>
                      <button className="adm-btn adm-btn-red adm-btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-title">Edit Player</div>
            <div className="adm-field">
              <label className="adm-field-label">Name</label>
              <input className="adm-input" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="adm-field">
              <label className="adm-field-label">ELO Rating</label>
              <input className="adm-input" type="number" value={editing.elo} onChange={e => setEditing(p => ({ ...p, elo: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="adm-field">
                <label className="adm-field-label">Wins</label>
                <input className="adm-input" type="number" value={editing.wins || 0} onChange={e => setEditing(p => ({ ...p, wins: e.target.value }))} />
              </div>
              <div className="adm-field">
                <label className="adm-field-label">Losses</label>
                <input className="adm-input" type="number" value={editing.losses || 0} onChange={e => setEditing(p => ({ ...p, losses: e.target.value }))} />
              </div>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button className="adm-btn" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", background: "transparent" }} onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Matches Tab ───────────────────────────────────────────────────────────────
function MatchesTab({ toast, confirm }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all"); // all | live | completed

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("id, player1_name, player2_name, status, score_a, score_b, current_game, started_at, match_type, active_scorer_id")
      .order("started_at", { ascending: false })
      .limit(100);
    setMatches(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = matches.filter(m => {
    const matchesSearch = (m.player1_name + " " + m.player2_name).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  async function handleForceEnd(m) {
    confirm(
      `Force-end match?`,
      `${m.player1_name} vs ${m.player2_name} will be marked completed.`,
      async () => {
        const { error } = await supabase
          .from("matches")
          .update({ status: "completed", finished_at: new Date().toISOString() })
          .eq("id", m.id);
        if (error) { toast("Failed: " + error.message, "error"); return; }
        toast("Match ended ✓");
        load();
      }
    );
  }

  async function handleDelete(m) {
    confirm(
      `Delete match?`,
      `"${m.player1_name} vs ${m.player2_name}" — this cannot be undone.`,
      async () => {
        // Delete events first (FK constraint)
        await supabase.from("match_events").delete().eq("match_id", m.id);
        const { error } = await supabase.from("matches").delete().eq("id", m.id);
        if (error) { toast("Delete failed: " + error.message, "error"); return; }
        toast("Match deleted ✓");
        load();
      }
    );
  }

  async function handleResetScore(m) {
    confirm(
      `Reset score to 0-0?`,
      `${m.player1_name} vs ${m.player2_name}`,
      async () => {
        const { error } = await supabase
          .from("matches")
          .update({
            score_a: 0, score_b: 0,
            scores: [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }],
            current_game: 1,
            games_won: { p1: 0, p2: 0 },
          })
          .eq("id", m.id);
        if (error) { toast("Failed: " + error.message, "error"); return; }
        toast("Score reset ✓");
        load();
      }
    );
  }

  async function handleClearScorer(m) {
    const { error } = await supabase
      .from("matches")
      .update({ active_scorer_id: null, handoff_token: null })
      .eq("id", m.id);
    if (error) { toast("Failed: " + error.message, "error"); return; }
    toast("Scorer cleared ✓");
    load();
  }

  return (
    <>
      <div className="adm-toolbar">
        <input className="adm-search" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "live", "completed"].map(f => (
            <button
              key={f}
              className="adm-btn adm-btn-sm"
              style={{
                border: `1px solid ${filter === f ? "rgba(255,60,60,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: filter === f ? "#ff3c3c" : "rgba(255,255,255,0.3)",
                background: filter === f ? "rgba(255,60,60,0.08)" : "transparent",
              }}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="adm-empty"><div className="adm-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No matches found</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Status</th>
                <th>Score</th>
                <th>Game</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700 }}>
                    {m.player1_name} <span style={{ color: "rgba(255,255,255,0.3)" }}>vs</span> {m.player2_name}
                  </td>
                  <td>
                    {m.status === "live"
                      ? <span className="adm-status-live">LIVE</span>
                      : <span className="adm-status-done">{m.status?.toUpperCase()}</span>
                    }
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", color: "#ffd700" }}>
                    {m.score_a ?? 0} – {m.score_b ?? 0}
                  </td>
                  <td style={{ color: "rgba(255,255,255,0.4)" }}>{m.current_game || 1}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {m.match_type || "singles"}
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {m.started_at ? new Date(m.started_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {m.status === "live" && (
                        <>
                          <button className="adm-btn adm-btn-red adm-btn-sm" onClick={() => handleForceEnd(m)}>End</button>
                          <button className="adm-btn adm-btn-gold adm-btn-sm" onClick={() => handleResetScore(m)}>Reset</button>
                          <button className="adm-btn adm-btn-green adm-btn-sm" onClick={() => handleClearScorer(m)}>Clear Scorer</button>
                        </>
                      )}
                      <button className="adm-btn adm-btn-red adm-btn-sm" onClick={() => handleDelete(m)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin({ user, player, onNav }) {
  const [tab,     setTab]     = useState("players");
  const [stats,   setStats]   = useState(null);
  const [toast,   setToast]   = useState(null);   // {message, type}
  const [confirm, setConfirm] = useState(null);   // {message, sub, onConfirm}

  // Verify admin
  const isAdmin = localStorage.getItem("is_admin") === "true" || user?.email === "katariavsk@gmail.com";

  useEffect(() => {
    if (!isAdmin) { setTimeout(() => onNav("dashboard"), 1500); return; }
    loadStats();
  }, []);

  async function loadStats() {
    const [
      { count: playerCount },
      { count: matchCount },
      { count: liveCount },
      { count: completedCount },
    ] = await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*",  { count: "exact", head: true }),
      supabase.from("matches").select("*",  { count: "exact", head: true }).eq("status", "live"),
      supabase.from("matches").select("*",  { count: "exact", head: true }).eq("status", "completed"),
    ]);
    setStats({ playerCount, matchCount, liveCount, completedCount });
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  function showConfirm(message, sub, onConfirm) {
    setConfirm({ message, sub, onConfirm });
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#060709", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono, monospace", color: "#ff3c3c" }}>
        Access Denied — Redirecting...
      </div>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="adm-root">

        {toast && (
          <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}

        {confirm && (
          <Confirm
            message={confirm.message}
            sub={confirm.sub}
            onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
            onCancel={() => setConfirm(null)}
          />
        )}

        {/* TOP BAR */}
        <div className="adm-topbar">
          <div className="adm-logo">MATCH<span>X</span></div>
          <div className="adm-badge">⚡ Admin Panel</div>
          <button className="adm-back" onClick={() => onNav("dashboard")}>← Dashboard</button>
        </div>

        <div className="adm-body">

          {/* STATS */}
          <div className="adm-stats">
            <div className="adm-stat">
              <div className="adm-stat-n">{stats?.playerCount ?? "—"}</div>
              <div className="adm-stat-l">Total Players</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-n">{stats?.matchCount ?? "—"}</div>
              <div className="adm-stat-l">Total Matches</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-n" style={{ color: "#00ffa0" }}>{stats?.liveCount ?? "—"}</div>
              <div className="adm-stat-l">Live Now</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-n" style={{ color: "#ffd700" }}>{stats?.completedCount ?? "—"}</div>
              <div className="adm-stat-l">Completed</div>
            </div>
          </div>

          {/* TABS */}
          <div className="adm-tabs">
            <button className={`adm-tab ${tab === "players" ? "active" : ""}`} onClick={() => setTab("players")}>
              👤 Players
            </button>
            <button className={`adm-tab ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>
              🏸 Matches
            </button>
          </div>

          {/* TAB CONTENT */}
          {tab === "players" && (
            <PlayersTab toast={showToast} confirm={showConfirm} />
          )}
          {tab === "matches" && (
            <MatchesTab toast={showToast} confirm={showConfirm} />
          )}

        </div>
      </div>
    </>
  );
}