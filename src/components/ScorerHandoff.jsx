/**
 * ScorerHandoff.jsx
 * src/components/ScorerHandoff.jsx
 *
 * FIXES:
 * 1. Watches handoff_token being cleared in DB (triggered by new scorer in App.jsx)
 *    → calls onHandoffAccepted so old phone demotes cleanly
 * (active_scorer_id is written by App.jsx → loadMatchAndBecomeScorer, which
 *  triggers MatchScorer.jsx's realtime watcher to demote the old scorer device)
 */

import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .sh-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: sh-fade 0.2s ease;
  }

  @keyframes sh-fade { from { opacity: 0; } to { opacity: 1; } }

  .sh-card {
    background: #0a0c12;
    border: 1px solid rgba(212, 175, 55, 0.2);
    max-width: 420px; width: 100%;
    padding: 36px 32px;
    position: relative;
    animation: sh-up 0.25s ease;
  }

  @keyframes sh-up {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .sh-corner {
    position: absolute; width: 14px; height: 14px;
    border-color: rgba(212, 175, 55, 0.3); border-style: solid;
  }
  .sh-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
  .sh-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
  .sh-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
  .sh-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

  .sh-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(212, 175, 55, 0.6); margin-bottom: 8px;
  }

  .sh-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px; letter-spacing: 0.06em;
    color: #ffd700; margin-bottom: 6px;
  }

  .sh-sub {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 24px; line-height: 1.5;
  }

  .sh-scope {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; margin-bottom: 24px;
  }

  .sh-scope-btn {
    padding: 10px 12px; border: 1px solid; cursor: pointer;
    background: transparent; transition: all 0.2s; text-align: left;
  }
  .sh-scope-btn.active-match {
    border-color: rgba(0, 255, 200, 0.4);
    background: rgba(0, 255, 200, 0.06);
  }
  .sh-scope-btn.inactive-match {
    border-color: rgba(255,255,255,0.08); background: transparent;
  }
  .sh-scope-btn.active-tournament {
    border-color: rgba(255, 215, 0, 0.4);
    background: rgba(255, 215, 0, 0.06);
  }
  .sh-scope-btn.inactive-tournament {
    border-color: rgba(255,255,255,0.08); background: transparent;
  }
  .sh-scope-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px; letter-spacing: 0.06em;
    display: block; margin-bottom: 2px;
  }
  .sh-scope-btn.active-match .sh-scope-name   { color: #00ffc8; }
  .sh-scope-btn.inactive-match .sh-scope-name { color: rgba(255,255,255,0.3); }
  .sh-scope-btn.active-tournament .sh-scope-name   { color: #ffd700; }
  .sh-scope-btn.inactive-tournament .sh-scope-name { color: rgba(255,255,255,0.3); }
  .sh-scope-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }

  .sh-qr-box {
    background: #fff; padding: 16px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; min-height: 200px; position: relative;
  }
  .sh-qr-box img { display: block; max-width: 100%; }
  .sh-qr-loading {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #999; letter-spacing: 0.1em;
  }

  .sh-url-row {
    display: flex; gap: 8px; margin-bottom: 20px; align-items: stretch;
  }
  .sh-url {
    flex: 1; padding: 10px 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.06em;
    color: rgba(255,255,255,0.5);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sh-copy-btn {
    padding: 10px 16px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.25);
    color: #ffd700;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; white-space: nowrap; transition: all 0.2s;
  }
  .sh-copy-btn:hover { background: rgba(212, 175, 55, 0.2); }
  .sh-copy-btn.copied { color: #00ffc8; border-color: rgba(0,255,200,0.3); }

  .sh-waiting {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(0, 255, 200, 0.12);
    background: rgba(0, 255, 200, 0.04);
    margin-bottom: 20px;
  }
  .sh-waiting-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00ffc8;
    animation: sh-pulse 1.5s ease-in-out infinite;
  }
  @keyframes sh-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }
  .sh-waiting-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(0, 255, 200, 0.6);
  }

  .sh-close-btn {
    width: 100%; padding: 14px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 17px; letter-spacing: 0.1em;
    cursor: pointer; transition: all 0.2s;
  }
  .sh-close-btn:hover { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.7); }

  .sh-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255,255,255,0.15); text-align: center; margin-top: 12px;
  }
`;

function QRCode({ url, size = 180 }) {
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=000000&margin=0`;
  return <img src={src} width={size} height={size} alt="Scorer handoff QR code" />;
}

export default function ScorerHandoff({ matchId, matchData, onClose, onHandoffAccepted }) {
  const [scope,   setScope]   = useState("match");
  const [copied,  setCopied]  = useState(false);
  const [token,   setToken]   = useState(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    generateToken();
  }, [matchId]);

  // ── FIX 2b: Watch for handoff_token being cleared OR active_scorer_id changing
  // When the new scorer's App.jsx runs loadMatchAndBecomeScorer, it writes:
  //   active_scorer_id = newUserId
  //   handoff_token    = null
  // This listener fires on the OLD phone and calls onHandoffAccepted to
  // cleanly close the handoff panel. The actual scorer demotion is handled
  // separately by MatchScorer.jsx's active_scorer_id watcher.
  useEffect(() => {
    if (!matchId || !token) return;

    const channel = supabase
      .channel("handoff-watch-" + matchId)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new;
          // Token cleared means new scorer accepted handoff
          if (!row.handoff_token) {
            onHandoffAccepted?.();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [matchId, token]);

  async function generateToken() {
    const t = Math.random().toString(36).slice(2, 10).toUpperCase();
    setToken(t);
    setWaiting(true);

    await supabase
      .from("matches")
      .update({ handoff_token: t, handoff_scope: scope })
      .eq("id", matchId);
  }

  // URL format matches what App.jsx checks on load:
  // App.jsx useEffect: params.get("scorer") === "1" && params.get("matchId")
  function buildHandoffUrl() {
    const base = window.location.origin;
    return `${base}/?scorer=1&matchId=${matchId}&token=${token}&scope=${scope}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildHandoffUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }

  async function handleScopeChange(newScope) {
    setScope(newScope);
    if (matchId && token) {
      await supabase
        .from("matches")
        .update({ handoff_scope: newScope })
        .eq("id", matchId);
    }
  }

  const handoffUrl = token ? buildHandoffUrl() : "";

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="sh-overlay"
        onClick={(e) => { if (e.target.className === "sh-overlay") onClose(); }}
      >
        <div className="sh-card">
          <div className="sh-corner sh-tl" />
          <div className="sh-corner sh-tr" />
          <div className="sh-corner sh-bl" />
          <div className="sh-corner sh-br" />

          <div className="sh-label">Scorer Handoff</div>
          <div className="sh-title">Pass Scoring to Another Phone</div>
          <div className="sh-sub">
            New scorer scans this QR (must be logged in). They confirm scorer role — you automatically become spectator.
          </div>

          <div className="sh-scope">
            <button
              className={`sh-scope-btn ${scope === "match" ? "active-match" : "inactive-match"}`}
              onClick={() => handleScopeChange("match")}
            >
              <span className="sh-scope-name">This Match</span>
              <span className="sh-scope-desc">Current game only</span>
            </button>
            <button
              className={`sh-scope-btn ${scope === "tournament" ? "active-tournament" : "inactive-tournament"}`}
              onClick={() => handleScopeChange("tournament")}
            >
              <span className="sh-scope-name">Tournament</span>
              <span className="sh-scope-desc">All remaining matches</span>
            </button>
          </div>

          <div className="sh-qr-box">
            {!token && <span className="sh-qr-loading">Generating...</span>}
            {token  && <QRCode url={handoffUrl} size={180} />}
          </div>

          <div className="sh-url-row">
            <div className="sh-url">{handoffUrl || "Generating link..."}</div>
            <button
              className={`sh-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
              disabled={!token}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          {waiting && (
            <div className="sh-waiting">
              <div className="sh-waiting-dot" />
              <span className="sh-waiting-text">Waiting for new scorer to accept...</span>
            </div>
          )}

          <button className="sh-close-btn" onClick={onClose}>
            Cancel — Keep Scoring
          </button>

          <div className="sh-hint">
            Link expires when accepted · New scorer must be logged in · You become spectator on accept
          </div>
        </div>
      </div>
    </>
  );
}