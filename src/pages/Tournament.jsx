import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .tn-root {
    min-height: 100vh; background: var(--mx-bg); color: var(--mx-text);
    font-family: 'Rajdhani', sans-serif; position: relative;
  }
  .tn-root::before {
    content: ''; position: fixed; inset: 0;
    background: var(--mx-overlay); pointer-events: none; z-index: 0;
  }
  .tn-inner {
    position: relative; z-index: 1;
    max-width: 1000px; margin: 0 auto; padding: 48px 32px 80px;
  }
  .tn-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    border-bottom: 1px solid var(--mx-border); padding-bottom: 24px; margin-bottom: 28px;
  }
  .tn-eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: var(--mx-accent); text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .tn-eyebrow::before { content:''; display:inline-block; width:20px; height:1px; background:var(--mx-accent); }
  .tn-title {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px,6vw,64px);
    letter-spacing: 0.05em; color: var(--mx-score); margin: 0;
  }
  .tn-sub {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: var(--mx-text-3); margin-top: 4px; text-transform: uppercase;
  }

  .tn-create-btn {
    padding: 12px 24px; background: var(--mx-accent);
    color: #020905; border: none; cursor: pointer;
    font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.1em;
    transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .tn-create-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .tn-tabs {
    display: flex; gap: 0; border-bottom: 1px solid var(--mx-border); margin-bottom: 28px;
  }
  .tn-tab {
    font-family: 'Rajdhani', sans-serif; font-size: 12px; letter-spacing: 2px;
    font-weight: 700; text-transform: uppercase; padding: 12px 22px;
    cursor: pointer; color: var(--mx-text-3); border-bottom: 2px solid transparent;
    transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none;
  }
  .tn-tab:hover { color: var(--mx-text-2); }
  .tn-tab.active { color: var(--mx-accent); border-bottom-color: var(--mx-accent); }

  .tn-list { display: flex; flex-direction: column; gap: 14px; }

  .tn-card {
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    padding: 24px; display: grid; grid-template-columns: 1fr auto;
    gap: 20px; align-items: center; transition: all 0.2s;
    border-radius: 6px; position: relative; overflow: hidden;
  }
  .tn-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 4px; height: 100%; background: var(--tn-accent, var(--mx-accent));
  }
  .tn-card:hover { border-color: var(--mx-border-hover); transform: translateX(3px); }

  .tn-name {
    font-family: 'Bebas Neue', sans-serif; font-size: 26px;
    letter-spacing: 0.05em; color: var(--mx-text); margin-bottom: 8px;
  }
  .tn-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .tn-meta-item {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 500;
    color: var(--mx-text-3); display: flex; align-items: center; gap: 4px;
  }
  .tn-winner-tag {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600;
    color: var(--mx-score); margin-top: 6px;
  }
  .tn-right { text-align: right; }
  .tn-prize-lbl {
    font-family: 'JetBrains Mono', monospace; font-size: 8px;
    letter-spacing: 0.16em; color: var(--mx-text-3); text-transform: uppercase; margin-bottom: 4px;
  }
  .tn-prize {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px;
    color: var(--mx-score); letter-spacing: 0.04em; white-space: nowrap; margin-bottom: 8px;
  }

  .tn-status {
    display: inline-block; padding: 4px 12px;
    font-family: 'Rajdhani', sans-serif; font-size: 10px;
    font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 3px;
  }
  .tn-status-open   { background: var(--mx-badge-live-bg); color: var(--mx-badge-live-text); border: 1px solid var(--mx-badge-live-border); }
  .tn-status-live   { background: rgba(255,50,80,0.12); color: #ff3250; border: 1px solid rgba(255,50,80,0.3); animation: tnpulse 1s infinite; }
  .tn-status-soon   { background: rgba(255,184,0,0.1); color: #ffb800; border: 1px solid rgba(255,184,0,0.25); }
  .tn-status-done   { background: var(--mx-surface); color: var(--mx-text-3); border: 1px solid var(--mx-border); }
  @keyframes tnpulse { 0%,100%{opacity:1}50%{opacity:0.7} }

  .tn-empty {
    text-align: center; padding: 60px 32px;
    border: 1px solid var(--mx-border); background: var(--mx-surface); border-radius: 8px;
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.15em; color: var(--mx-text-3); text-transform: uppercase;
  }

  /* ── Create Tournament Modal ── */
  .tn-modal-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .tn-modal {
    background: var(--mx-bg-card); border: 1px solid var(--mx-border);
    width: 100%; max-width: 520px; border-radius: 8px; padding: 32px; position: relative;
    max-height: 90vh; overflow-y: auto;
  }
  .tn-modal-close {
    position: absolute; top: 16px; right: 16px;
    background: var(--mx-surface); border: 1px solid var(--mx-border);
    color: var(--mx-text-2); width: 32px; height: 32px;
    cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; transition: all 0.2s;
  }
  .tn-modal-close:hover { color: var(--mx-text); border-color: var(--mx-border-hover); }
  .tn-modal-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px;
    letter-spacing: 0.08em; color: var(--mx-text); margin: 0 0 24px;
  }
  .tn-field { margin-bottom: 16px; }
  .tn-field-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.16em; color: var(--mx-text-3); text-transform: uppercase;
    display: block; margin-bottom: 6px;
  }
  .tn-input {
    width: 100%; background: var(--mx-bg); border: 1px solid var(--mx-border);
    color: var(--mx-text); font-family: 'Rajdhani', sans-serif;
    font-size: 14px; font-weight: 600; padding: 10px 14px; outline: none;
    transition: border-color 0.2s; border-radius: 4px;
  }
  .tn-input::placeholder { color: var(--mx-text-3); }
  .tn-input:focus { border-color: var(--mx-accent); }
  .tn-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .tn-submit {
    width: 100%; padding: 14px; background: var(--mx-accent);
    color: #020905; border: none; cursor: pointer;
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.1em;
    border-radius: 4px; transition: all 0.2s; margin-top: 8px;
  }
  .tn-submit:hover { opacity: 0.88; transform: translateY(-1px); }
  .tn-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .tn-error {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; color: #ff6060; margin-top: 10px;
    background: rgba(255,0,0,0.06); border: 1px solid rgba(255,0,0,0.15);
    padding: 8px 12px; border-radius: 4px;
  }

  @media (max-width: 640px) {
    .tn-inner { padding: 24px 16px 80px; }
    .tn-card { grid-template-columns: 1fr; gap: 12px; }
    .tn-right { text-align: left; display: flex; align-items: center; gap: 16px; }
    .tn-prize-lbl { display: none; }
  }
`;

export default function Tournament({ onNav }) {
  const [tab,        setTab]        = useState("upcoming");
  const [tournaments,setTournaments]= useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    name: "", date: "", location: "", prize: "", max_players: "32", status: "upcoming",
  });

  useEffect(() => { fetchTournaments(); }, []);

  async function fetchTournaments() {
    setLoading(true);
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });
    setTournaments(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Tournament name is required."); return; }
    setSaving(true);
    setFormError("");
    const { error } = await supabase.from("tournaments").insert({
      name:        form.name.trim(),
      date:        form.date || null,
      location:    form.location.trim() || null,
      prize:       form.prize.trim() || null,
      max_players: parseInt(form.max_players) || 32,
      status:      form.status,
    });
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    setShowCreate(false);
    setForm({ name: "", date: "", location: "", prize: "", max_players: "32", status: "upcoming" });
    fetchTournaments();
  }

  const filtered = tournaments.filter(t => {
    const s = (t.status || "upcoming").toLowerCase();
    if (tab === "upcoming")  return s === "upcoming" || s === "open" || s === "soon";
    if (tab === "ongoing")   return s === "ongoing"  || s === "live";
    if (tab === "completed") return s === "completed" || s === "done";
    return true;
  });

  const accentFor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "live" || s === "ongoing") return "#ff3250";
    if (s === "completed" || s === "done") return "rgba(255,255,255,0.1)";
    return "var(--mx-accent)";
  };

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "live" || s === "ongoing") return "tn-status-live";
    if (s === "soon") return "tn-status-soon";
    if (s === "completed" || s === "done") return "tn-status-done";
    return "tn-status-open";
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="tn-root">
        <div className="tn-inner">

          <div className="tn-header">
            <div>
              <div className="tn-eyebrow">🏆 Competitions</div>
              <h1 className="tn-title">Tournaments</h1>
              <div className="tn-sub">Season 2026 · All Categories</div>
            </div>
            {isAdmin && (
              <button className="tn-create-btn" onClick={() => setShowCreate(true)}>
                + Create Tournament
              </button>
            )}
          </div>

          <div className="tn-tabs">
            {["upcoming", "ongoing", "completed"].map(t => (
              <button key={t} className={`tn-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t} {t === "ongoing" && <span style={{ color: "#ff3250" }}>●</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--mx-text-3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.15em" }}>
              LOADING...
            </div>
          ) : filtered.length === 0 ? (
            <div className="tn-empty">
              No {tab} tournaments yet
              {isAdmin && (
                <div style={{ marginTop: 16 }}>
                  <button className="tn-create-btn" onClick={() => setShowCreate(true)}>+ Create one</button>
                </div>
              )}
            </div>
          ) : (
            <div className="tn-list">
              {filtered.map((t, i) => (
                <div key={t.id || i} className="tn-card" style={{ "--tn-accent": accentFor(t.status) }}>
                  <div>
                    <div className="tn-name">{t.name}</div>
                    <div className="tn-meta">
                      {t.date && <div className="tn-meta-item">📅 {t.date}</div>}
                      {t.location && <div className="tn-meta-item">📍 {t.location}</div>}
                      {t.max_players && <div className="tn-meta-item">👥 {t.max_players} Players</div>}
                    </div>
                    {t.winner && <div className="tn-winner-tag">🏅 Winner: {t.winner}</div>}
                  </div>
                  <div className="tn-right">
                    {t.prize && (
                      <>
                        <div className="tn-prize-lbl">Prize Pool</div>
                        <div className="tn-prize">{t.prize}</div>
                      </>
                    )}
                    <div className={`tn-status ${statusClass(t.status)}`}>
                      {t.status || "Open"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Tournament Modal ── */}
      {showCreate && (
        <div className="tn-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="tn-modal">
            <button className="tn-modal-close" onClick={() => setShowCreate(false)}>✕</button>
            <div className="tn-modal-title">Create Tournament</div>
            <form onSubmit={handleCreate}>
              <div className="tn-field">
                <label className="tn-field-label">Tournament Name *</label>
                <input className="tn-input" placeholder="e.g. MatchX Open 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="tn-row2">
                <div className="tn-field">
                  <label className="tn-field-label">Date</label>
                  <input className="tn-input" placeholder="e.g. May 1–3, 2026" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="tn-field">
                  <label className="tn-field-label">Max Players</label>
                  <input className="tn-input" type="number" min="2" value={form.max_players} onChange={e => setForm(f => ({ ...f, max_players: e.target.value }))} />
                </div>
              </div>
              <div className="tn-field">
                <label className="tn-field-label">Location</label>
                <input className="tn-input" placeholder="e.g. Delhi Sports Complex" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="tn-row2">
                <div className="tn-field">
                  <label className="tn-field-label">Prize Pool</label>
                  <input className="tn-input" placeholder="e.g. ₹50,000" value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} />
                </div>
                <div className="tn-field">
                  <label className="tn-field-label">Status</label>
                  <select className="tn-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="soon">Coming Soon</option>
                  </select>
                </div>
              </div>
              {formError && <div className="tn-error">{formError}</div>}
              <button type="submit" className="tn-submit" disabled={saving}>
                {saving ? "Creating..." : "⚡ Create Tournament"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}