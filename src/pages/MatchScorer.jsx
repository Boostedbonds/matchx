/**
 * MatchScorer.jsx
 * src/pages/MatchScorer.jsx
 *
 * FIX 4 — applyDBRow was overwriting correct scores with stale JSON column
 *   The `scores` JSON column in DB is never updated (always all zeros).
 *   Old code: read score_a/score_b correctly → then immediately overwrote
 *   with `scores` JSON array → always reset display to 0-0 on every poll.
 *   Fix: score_a/score_b are authoritative for the current game.
 *   The `scores` JSON column is only used for OTHER games (historical).
 *
 * FIX 1 — Broadcast channel name mismatch (sender/listener on different channels)
 * FIX 2 — Poll overwriting optimistic score (lastWriteRef guard)
 * FIX 3 — broadcastScore created a new channel every call (channelRef reuse)
 */

import { useState, useEffect, useRef } from "react";
import {
  createMatchState,
  addPoint,
  undoPoint,
  SHOT_TYPES,
} from "../services/matchEngine";
import {
  updateMatch,
  finishMatch,
  saveEvent,
  updatePlayerStats,
} from "../services/matchService";
import { supabase } from "../services/supabase";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  .scorer-root {
    min-height: 100vh; background: #030508; color: #e8e0d0;
    font-family: 'Rajdhani', sans-serif; display: flex; flex-direction: column;
  }
  .scorer-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid rgba(212,175,55,0.12);
    background: rgba(0,0,0,0.4); gap: 12px; flex-wrap: wrap;
  }
  .scorer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.1em; color: #ffd700; }
  .scorer-share {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.15em; color: rgba(212,175,55,0.5);
    padding: 6px 12px; border: 1px solid rgba(212,175,55,0.15);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;
  }
  .scorer-exit-btn {
    background: transparent; border: 1px solid rgba(255,100,100,0.3);
    color: rgba(255,100,100,0.6); padding: 6px 16px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; cursor: pointer; transition: all 0.2s;
  }
  .scorer-exit-btn:hover { border-color: #ff6464; color: #ff6464; }
  .scorer-handoff-btn {
    background: transparent; border: 1px solid rgba(212,175,55,0.25);
    color: rgba(212,175,55,0.7); padding: 6px 14px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .scorer-handoff-btn:hover { border-color: #ffd700; color: #ffd700; background: rgba(212,175,55,0.06); }
  .scorer-role-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; text-transform: uppercase; padding: 5px 12px;
    border: 1px solid rgba(0,136,255,0.25); color: rgba(0,136,255,0.7); background: rgba(0,136,255,0.06);
  }
  .live-indicator {
    display: flex; align-items: center; gap: 6px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; text-transform: uppercase; color: rgba(0,230,160,0.7);
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00e6a0; box-shadow: 0 0 6px #00e6a0;
    animation: live-pulse 1.8s ease-in-out infinite;
  }
  @keyframes live-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }
  .scorer-body {
    flex: 1; display: flex; flex-direction: column;
    max-width: 960px; margin: 0 auto; width: 100%; padding: 24px 20px 40px;
  }
  .scorer-board {
    display: grid; grid-template-columns: 1fr auto 1fr;
    border: 1px solid rgba(212,175,55,0.15); margin-bottom: 24px; overflow: hidden;
  }
  .scorer-team {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 24px 16px; gap: 6px;
    cursor: pointer; transition: background 0.15s; position: relative; user-select: none;
  }
  .scorer-team.scorer-only:active { background: rgba(0,230,160,0.08); }
  .scorer-team.left  { border-right: 1px solid rgba(212,175,55,0.1); }
  .scorer-team.right { border-left:  1px solid rgba(212,175,55,0.1); }
  .scorer-team.doubles { padding: 0; flex-direction: column; cursor: default; }
  .scorer-team.doubles:active { background: none; }
  .doubles-player {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; cursor: pointer; transition: background 0.15s;
    border-bottom: 1px solid rgba(212,175,55,0.07); position: relative;
  }
  .doubles-player:last-child { border-bottom: none; }
  .doubles-player:hover { background: rgba(0,230,160,0.06); }
  .doubles-player.scorer-only:active { background: rgba(0,230,160,0.1); }
  .dp-serve-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00e6a0; box-shadow: 0 0 6px #00e6a0; flex-shrink: 0;
  }
  .dp-serve-dot.hidden { visibility: hidden; }
  .dp-init {
    width: 34px; height: 34px; flex-shrink: 0;
    border: 1px solid rgba(212,175,55,0.2);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #ffd700;
    background: rgba(212,175,55,0.04);
  }
  .dp-name {
    flex: 1; font-family: 'Bebas Neue', sans-serif; font-size: 14px;
    letter-spacing: 0.05em; color: #e8e0d0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dp-hint {
    font-family: 'JetBrains Mono', monospace; font-size: 8px;
    letter-spacing: 0.1em; color: rgba(0,230,160,0.4); text-transform: uppercase; flex-shrink: 0;
  }
  .team-score-row {
    width: 100%; display: flex; justify-content: center; align-items: center;
    padding: 10px 0 16px;
  }
  .scorer-serve-dot {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    width: 7px; height: 7px; border-radius: 50%;
    background: #00e6a0; box-shadow: 0 0 8px #00e6a0;
  }
  .scorer-init {
    width: 48px; height: 48px; border: 1px solid rgba(212,175,55,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #ffd700;
    background: rgba(212,175,55,0.05);
  }
  .scorer-name {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px;
    letter-spacing: 0.06em; color: #e8e0d0; text-align: center;
    max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .scorer-score {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(60px, 10vw, 100px);
    letter-spacing: -0.02em; line-height: 1; color: #ffd700;
  }
  .scorer-hint {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: rgba(0,230,160,0.4); text-transform: uppercase;
  }
  .scorer-mid {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 16px 12px; gap: 8px;
    background: rgba(212,175,55,0.02); min-width: 60px;
  }
  .scorer-game-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; color: rgba(212,175,55,0.4); text-transform: uppercase;
  }
  .scorer-game-no { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: rgba(212,175,55,0.6); letter-spacing: 0.05em; }
  .scorer-games-won { display: flex; gap: 4px; }
  .gw-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.2);
  }
  .gw-dot.won { background: #ffd700; box-shadow: 0 0 6px rgba(255,215,0,0.5); }
  .team-name-header {
    width: 100%; padding: 8px 14px 6px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(0,255,200,0.5); border-bottom: 1px solid rgba(0,255,200,0.08);
    background: rgba(0,255,200,0.03);
  }
  .team-name-header.right {
    color: rgba(255,184,0,0.5); border-bottom-color: rgba(255,184,0,0.08);
    background: rgba(255,184,0,0.03); text-align: right;
  }
  .shot-picker { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
  @media (max-width: 480px) { .shot-picker { grid-template-columns: repeat(2, 1fr); } }
  .shot-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px;
    background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.12);
    cursor: pointer; transition: all 0.15s; color: #e8e0d0;
  }
  .shot-btn:hover { background: rgba(0,230,160,0.08); border-color: rgba(0,230,160,0.3); }
  .shot-icon { font-size: 20px; }
  .shot-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(232,224,208,0.5); }
  .shot-picker-label {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.18em; color: #00e6a0; text-transform: uppercase;
    margin-bottom: 10px; text-align: center;
  }
  .scorer-controls { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .ctrl-btn {
    flex: 1; min-width: 100px; padding: 12px 16px;
    background: rgba(212,175,55,0.04); border: 1px solid rgba(212,175,55,0.15);
    color: rgba(212,175,55,0.7); font-family: 'Bebas Neue', sans-serif; font-size: 15px;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
  }
  .ctrl-btn:hover { background: rgba(212,175,55,0.1); color: #ffd700; }
  .ctrl-btn.danger { border-color: rgba(255,80,80,0.2); color: rgba(255,100,100,0.6); }
  .ctrl-btn.danger:hover { background: rgba(255,80,80,0.08); color: #ff6464; }
  .commentary-box {
    border: 1px solid rgba(212,175,55,0.1); background: rgba(0,0,0,0.3);
    max-height: 200px; overflow-y: auto; padding: 12px 16px;
  }
  .commentary-line {
    font-size: 14px; font-weight: 500; letter-spacing: 0.02em;
    color: rgba(232,224,208,0.7); padding: 5px 0;
    border-bottom: 1px solid rgba(212,175,55,0.05); line-height: 1.4;
  }
  .commentary-line:first-child { color: #e8e0d0; }
  .commentary-line:last-child { border-bottom: none; }
  .winner-banner {
    text-align: center; padding: 40px 24px;
    border: 1px solid rgba(212,175,55,0.25); background: rgba(212,175,55,0.04); margin-bottom: 24px;
  }
  .winner-trophy { font-size: 56px; margin-bottom: 12px; }
  .winner-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 0.08em;
    background: linear-gradient(135deg, #ffd700, #fff8dc, #d4af37);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .winner-sub { font-size: 16px; color: rgba(232,224,208,0.5); letter-spacing: 0.06em; margin-top: 8px; }
  .scorer-loading {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; flex-direction: column; gap: 16px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    letter-spacing: 0.15em; color: rgba(212,175,55,0.5);
  }
  .scorer-spinner {
    width: 28px; height: 28px;
    border: 2px solid rgba(212,175,55,0.15); border-top-color: #d4af37;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .demoted-banner {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.92); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px; padding: 40px;
  }
  .demoted-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 36px;
    letter-spacing: 0.08em; color: #ffd700; text-align: center;
  }
  .demoted-sub {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    letter-spacing: 0.15em; color: rgba(255,255,255,0.4);
    text-align: center; text-transform: uppercase;
  }
`;

// ── Apply a DB row onto existing match state ──────────────────────────────────
// FIX 4: score_a / score_b are the authoritative source for the current game.
// The `scores` JSON column is NEVER updated by updateMatch (always stays 0).
// Old code overwrote the correct score_a/score_b with the stale JSON column,
// resetting the display to 0-0 on every poll and postgres_changes event.
function applyDBRow(prev, row) {
  const gameIdx = (row.current_game ?? prev.currentGame) - 1;

  const parsedScores = prev.scores.map((s, i) => {
    if (i === gameIdx) {
      // Current game: use score_a / score_b — these are updated on every point.
      // Never fall back to the `scores` JSON column for the current game.
      return {
        p1: row.score_a != null ? row.score_a : s.p1,
        p2: row.score_b != null ? row.score_b : s.p2,
      };
    }

    // Past games: use `scores` JSON for historical game scores only.
    if (row.scores) {
      try {
        const db = typeof row.scores === "string" ? JSON.parse(row.scores) : row.scores;
        if (Array.isArray(db) && db[i]) {
          return { p1: db[i].p1 ?? s.p1, p2: db[i].p2 ?? s.p2 };
        }
      } catch (_) { /* keep prev */ }
    }

    return s;
  });

  return {
    ...prev,
    scores:      parsedScores,
    gamesWon:    row.games_won    ?? prev.gamesWon,
    currentGame: row.current_game ?? prev.currentGame,
    server:      row.server       ?? prev.server,
    ...(row.status === "completed"
      ? { status: "finished", winner: row.winner ?? prev.winner }
      : {}),
  };
}

// ── Apply a broadcast payload ─────────────────────────────────────────────────
function applyBroadcast(prev, payload) {
  if (!prev || !payload) return prev;
  return {
    ...prev,
    scores:      payload.scores      ?? prev.scores,
    gamesWon:    payload.gamesWon    ?? prev.gamesWon,
    currentGame: payload.currentGame ?? prev.currentGame,
    server:      payload.server      ?? prev.server,
    commentary:  payload.commentary  ?? prev.commentary,
    status:      payload.status      ?? prev.status,
    winner:      payload.winner      ?? prev.winner,
  };
}

function parsePlayers(matchData) {
  const isDoubles = matchData.match_type === "doubles";
  if (!isDoubles) {
    return {
      p1: { id: matchData.player1_id, name: matchData.player1_name || "Player 1" },
      p2: { id: matchData.player2_id, name: matchData.player2_name || "Player 2" },
      p3: null, p4: null,
    };
  }
  const [a1, a2] = (matchData.player1_name || "").split(" / ").map(s => s.trim());
  const [b1, b2] = (matchData.player2_name || "").split(" / ").map(s => s.trim());
  return {
    p1: { id: matchData.player1_id,  name: a1 || "Player A1" },
    p2: { id: matchData.player2_id,  name: b1 || "Player B1" },
    p3: { id: matchData.player3_id,  name: a2 || "Player A2" },
    p4: { id: matchData.player4_id,  name: b2 || "Player B2" },
  };
}

async function fetchMatchRow(matchId) {
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  return data || null;
}

export default function MatchScorer({ onNav, matchData, role = "spectator", onMatchEnd, onHandoff, onForceDemote }) {
  const [match,      setMatch]      = useState(null);
  const [shotPicker, setShotPicker] = useState(null);
  const [demoted,    setDemoted]    = useState(false);

  const commentaryRef    = useRef(null);
  const currentUserIdRef = useRef(null);
  const channelRef       = useRef(null);
  const lastWriteRef     = useRef(0);

  const isScorer  = role === "scorer" && !demoted;
  const isDoubles = matchData?.match_type === "doubles";
  const players   = matchData ? parsePlayers(matchData) : null;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      currentUserIdRef.current = data?.user?.id ?? null;
    });
  }, []);

  // ── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!matchData) return;

    const p1 = {
      id:     matchData.player1_id,
      name:   players.p1.name,
      init:   players.p1.name.slice(0, 2).toUpperCase(),
      rating: matchData.player1_rating || 1000,
    };
    const p2 = {
      id:     matchData.player2_id,
      name:   players.p2.name,
      init:   players.p2.name.slice(0, 2).toUpperCase(),
      rating: matchData.player2_rating || 1000,
    };

    setMatch(createMatchState(p1, p2));

    if (matchData.id) {
      fetchMatchRow(matchData.id).then(row => {
        if (row) setMatch(prev => prev ? applyDBRow(prev, row) : prev);
      });
    }
  }, [matchData?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── REALTIME ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!matchData?.id) return;

    const channel = supabase
      .channel(`match-live-${matchData.id}`)
      .on("broadcast", { event: "score" }, ({ payload }) => {
        setMatch(prev => applyBroadcast(prev, payload));
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchData.id}` },
        (payload) => {
          const row = payload.new;
          if (
            role === "scorer" &&
            row.active_scorer_id != null &&
            currentUserIdRef.current != null &&
            row.active_scorer_id !== currentUserIdRef.current
          ) {
            setDemoted(true);
            onForceDemote?.();
            return;
          }
          if (Date.now() - lastWriteRef.current < 4000) return;
          setMatch(prev => prev ? applyDBRow(prev, row) : prev);
        }
      )
      .subscribe();

    channelRef.current = channel;

    const pollInterval = setInterval(async () => {
      if (Date.now() - lastWriteRef.current < 4000) return;
      const row = await fetchMatchRow(matchData.id);
      if (!row) return;
      if (
        role === "scorer" &&
        row.active_scorer_id != null &&
        currentUserIdRef.current != null &&
        row.active_scorer_id !== currentUserIdRef.current
      ) {
        setDemoted(true);
        onForceDemote?.();
        clearInterval(pollInterval);
        return;
      }
      setMatch(prev => prev ? applyDBRow(prev, row) : prev);
    }, 3000);

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [matchData?.id, role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (commentaryRef.current) commentaryRef.current.scrollTop = 0;
  }, [match?.commentary]);

  if (!match) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="scorer-root">
          <div className="scorer-loading"><div className="scorer-spinner" />LOADING MATCH...</div>
        </div>
      </>
    );
  }

  const gIdx   = match.currentGame - 1;
  const score  = match.scores[gIdx] || match.scores[0];
  const isLive = match.status === "live";

  async function broadcastScore(nextMatch) {
    if (!channelRef.current) return;
    try {
      await channelRef.current.send({
        type:    "broadcast",
        event:   "score",
        payload: {
          scores:      nextMatch.scores,
          gamesWon:    nextMatch.gamesWon,
          currentGame: nextMatch.currentGame,
          server:      nextMatch.server,
          commentary:  nextMatch.commentary,
          status:      nextMatch.status,
          winner:      nextMatch.winner,
        },
      });
    } catch (err) {
      console.warn("broadcast failed (poll will catch it):", err.message);
    }
  }

  async function commitPoint(scorer, shotType, scoringPlayerId) {
    const next     = addPoint(match, { scorer, shotType });
    const newEvent = next.events[next.events.length - 1];

    lastWriteRef.current = Date.now();
    setMatch(next);
    await broadcastScore(next);

    if (!matchData?.id) return;

    const gI = next.currentGame - 1;

    try {
      if (next.status === "finished") {
        const finishResult = await finishMatch(matchData.id, next.winner);
        if (!finishResult.success) console.error("finishMatch failed:", finishResult.error);

        const teamAWon = next.winner === "p1";
        const allPlayers = [
          { id: players.p1.id, won: teamAWon },
          { id: players.p2.id, won: !teamAWon },
          ...(isDoubles ? [
            { id: players.p3?.id, won: teamAWon },
            { id: players.p4?.id, won: !teamAWon },
          ] : []),
        ];
        for (const p of allPlayers) {
          if (p.id) await updatePlayerStats(p.id, { won: p.won, shotType });
        }
        setTimeout(() => onMatchEnd?.(), 3000);
      } else {
        const updateResult = await updateMatch(matchData.id, {
          score_a:      next.scores[gI].p1,
          score_b:      next.scores[gI].p2,
          scores:       next.scores,
          games_won:    next.gamesWon,
          current_game: next.currentGame,
          server:       next.server,
          status:       next.status,
        });
        if (!updateResult.success) {
          console.error("Score write FAILED:", updateResult.error);
        }

        const eventResult = await saveEvent(matchData.id, newEvent, scoringPlayerId || null);
        if (!eventResult.success) console.error("saveEvent failed:", eventResult.error);
      }
    } catch (err) {
      console.error("commitPoint error:", err);
    }
  }

  function handleTeamTap(team) {
    if (!isScorer || !isLive || isDoubles) return;
    setShotPicker({ team, playerId: team === "p1" ? players.p1.id : players.p2.id });
  }

  function handleDoublesPlayerTap(team, playerId) {
    if (!isScorer || !isLive) return;
    setShotPicker({ team, playerId });
  }

  async function handleShotPick(shotType) {
    const { team, playerId } = shotPicker;
    setShotPicker(null);
    await commitPoint(team, shotType, playerId);
  }

  async function handleUndo() {
    const prev = undoPoint(match);
    lastWriteRef.current = Date.now();
    setMatch(prev);
    await broadcastScore(prev);
    if (matchData?.id) {
      const gI = prev.currentGame - 1;
      await updateMatch(matchData.id, {
        score_a:      prev.scores[gI].p1,
        score_b:      prev.scores[gI].p2,
        scores:       prev.scores,
        games_won:    prev.gamesWon,
        current_game: prev.currentGame,
        server:       prev.server,
      });
    }
  }

  async function handleEndMatch() {
    if (!window.confirm("End this match now?")) return;
    if (matchData?.id) await finishMatch(matchData.id, null);
    onMatchEnd?.();
  }

  const shareUrl = matchData?.id ? `${window.location.origin}/watch/${matchData.id}` : null;
  const pickerName = shotPicker
    ? (isDoubles
        ? [...Object.values(players)].filter(Boolean).find(p => p.id === shotPicker.playerId)?.name
        : (shotPicker.team === "p1" ? players.p1.name : players.p2.name))
    : "";

  return (
    <>
      <style>{STYLES}</style>
      <div className="scorer-root">

        {demoted && (
          <div className="demoted-banner">
            <div style={{ fontSize: 48 }}>📲</div>
            <div className="demoted-title">Scoring Handed Off</div>
            <div className="demoted-sub">Another device is now the scorer · You are now spectator</div>
            <button className="ctrl-btn" style={{ marginTop: 8, maxWidth: 240 }} onClick={() => setDemoted(false)}>
              Continue Watching →
            </button>
          </div>
        )}

        <div className="scorer-topbar">
          <div className="scorer-logo">MATCH<span style={{ color: "#00e6a0" }}>X</span></div>
          {!isScorer && !demoted && <div className="scorer-role-badge">👁 Spectator View</div>}
          {isLive && <div className="live-indicator"><div className="live-dot" />LIVE</div>}
          {shareUrl && <div className="scorer-share">👁 {shareUrl}</div>}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            {isScorer && onHandoff && (
              <button className="scorer-handoff-btn" onClick={onHandoff}>📲 Hand Off</button>
            )}
            {isScorer && (
              <button className="ctrl-btn danger" style={{ flex: "none", padding: "6px 14px", fontSize: 12 }} onClick={handleEndMatch}>
                END MATCH
              </button>
            )}
            <button className="scorer-exit-btn" onClick={() => onNav?.("dashboard")}>← DASHBOARD</button>
          </div>
        </div>

        <div className="scorer-body">

          {match.status === "finished" && (
            <div className="winner-banner">
              <div className="winner-trophy">🏆</div>
              <div className="winner-title">
                {match.winner === "p1"
                  ? (isDoubles ? `${players.p1.name} & ${players.p3?.name}` : players.p1.name)
                  : (isDoubles ? `${players.p2.name} & ${players.p4?.name}` : players.p2.name)
                } WINS!
              </div>
              <div className="winner-sub">Match Complete · Returning to dashboard…</div>
            </div>
          )}

          <div className="scorer-board">

            {isDoubles ? (
              <div className="scorer-team left doubles">
                <div className="team-name-header">▸ {matchData?.team_a_name || "Team A"}</div>
                <div className={`doubles-player ${isScorer ? "scorer-only" : ""}`} onClick={() => handleDoublesPlayerTap("p1", players.p1.id)}>
                  <div className={`dp-serve-dot ${match.server === "p1" ? "" : "hidden"}`} />
                  <div className="dp-init">{players.p1.name.slice(0, 2).toUpperCase()}</div>
                  <div className="dp-name">{players.p1.name}</div>
                  {isScorer && isLive && <div className="dp-hint">TAP</div>}
                </div>
                <div className={`doubles-player ${isScorer ? "scorer-only" : ""}`} onClick={() => handleDoublesPlayerTap("p1", players.p3?.id)}>
                  <div className="dp-serve-dot hidden" />
                  <div className="dp-init">{(players.p3?.name || "P3").slice(0, 2).toUpperCase()}</div>
                  <div className="dp-name">{players.p3?.name || "Player A2"}</div>
                  {isScorer && isLive && <div className="dp-hint">TAP</div>}
                </div>
                <div className="team-score-row"><div className="scorer-score">{score.p1}</div></div>
              </div>
            ) : (
              <div className={`scorer-team left ${isScorer ? "scorer-only" : ""}`} onClick={() => handleTeamTap("p1")}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,255,200,0.5)", marginBottom: 6 }}>
                  ▸ {matchData?.team_a_name || ""}
                </div>
                {match.server === "p1" && <div className="scorer-serve-dot" />}
                <div className="scorer-init">{match.player1.init}</div>
                <div className="scorer-name">{match.player1.name}</div>
                <div className="scorer-score">{score.p1}</div>
                {isScorer && isLive && <div className="scorer-hint">TAP TO SCORE</div>}
              </div>
            )}

            <div className="scorer-mid">
              <div className="scorer-game-label">Game</div>
              <div className="scorer-game-no">{match.currentGame}</div>
              <div className="scorer-game-label" style={{ marginTop: 8 }}>Games</div>
              <div className="scorer-games-won">
                {[0, 1].map(i => <div key={i} className={`gw-dot ${match.gamesWon.p1 > i ? "won" : ""}`} />)}
              </div>
              <div style={{ color: "rgba(212,175,55,0.3)", fontSize: 12, margin: "2px 0" }}>–</div>
              <div className="scorer-games-won">
                {[0, 1].map(i => <div key={i} className={`gw-dot ${match.gamesWon.p2 > i ? "won" : ""}`} />)}
              </div>
            </div>

            {isDoubles ? (
              <div className="scorer-team right doubles">
                <div className="team-name-header right">{matchData?.team_b_name || "Team B"} ◂</div>
                <div className={`doubles-player ${isScorer ? "scorer-only" : ""}`} onClick={() => handleDoublesPlayerTap("p2", players.p2.id)}>
                  <div className={`dp-serve-dot ${match.server === "p2" ? "" : "hidden"}`} />
                  <div className="dp-init">{players.p2.name.slice(0, 2).toUpperCase()}</div>
                  <div className="dp-name">{players.p2.name}</div>
                  {isScorer && isLive && <div className="dp-hint">TAP</div>}
                </div>
                <div className={`doubles-player ${isScorer ? "scorer-only" : ""}`} onClick={() => handleDoublesPlayerTap("p2", players.p4?.id)}>
                  <div className="dp-serve-dot hidden" />
                  <div className="dp-init">{(players.p4?.name || "P4").slice(0, 2).toUpperCase()}</div>
                  <div className="dp-name">{players.p4?.name || "Player B2"}</div>
                  {isScorer && isLive && <div className="dp-hint">TAP</div>}
                </div>
                <div className="team-score-row"><div className="scorer-score">{score.p2}</div></div>
              </div>
            ) : (
              <div className={`scorer-team right ${isScorer ? "scorer-only" : ""}`} onClick={() => handleTeamTap("p2")}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,184,0,0.5)", marginBottom: 6 }}>
                  {matchData?.team_b_name || ""} ◂
                </div>
                {match.server === "p2" && <div className="scorer-serve-dot" />}
                <div className="scorer-init">{match.player2.init}</div>
                <div className="scorer-name">{match.player2.name}</div>
                <div className="scorer-score">{score.p2}</div>
                {isScorer && isLive && <div className="scorer-hint">TAP TO SCORE</div>}
              </div>
            )}
          </div>

          {isScorer && shotPicker && (
            <div style={{ marginBottom: 20 }}>
              <div className="shot-picker-label">{pickerName} — select shot type</div>
              <div className="shot-picker">
                {SHOT_TYPES.map(s => (
                  <button key={s.id} className="shot-btn" onClick={() => handleShotPick(s.id)}>
                    <span className="shot-icon">{s.icon}</span>
                    <span className="shot-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isScorer && isLive && !shotPicker && (
            <div className="scorer-controls">
              <button className="ctrl-btn" onClick={handleUndo}>↩ UNDO</button>
              {onHandoff && <button className="ctrl-btn" onClick={onHandoff}>📲 HAND OFF SCORING</button>}
            </div>
          )}

          {match.commentary?.length > 0 && (
            <div className="commentary-box" ref={commentaryRef}>
              {match.commentary.map((line, i) => (
                <div key={i} className="commentary-line">{line}</div>
              ))}
            </div>
          )}

          {!isScorer && !demoted && (
            <div style={{ textAlign: "center", marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: "rgba(0,230,160,0.4)", textTransform: "uppercase" }}>
              👁 Spectator View · Live Updates
            </div>
          )}

        </div>
      </div>
    </>
  );
}