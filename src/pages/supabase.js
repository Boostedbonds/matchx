// src/utils/supabase.js
// Single source of truth for all Supabase interactions.
// Reads credentials from environment variables — never hardcode keys.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);


// ─── Players ──────────────────────────────────────────────────────────────────

export async function fetchPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPlayer(id) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayerStats(playerId, { won, shotType }) {
  const player = await fetchPlayer(playerId);
  if (!player) return;

  const shotCol = `${shotType}_count`;
  const newWins    = won ? player.wins + 1    : player.wins;
  const newLosses  = won ? player.losses      : player.losses + 1;
  const newStreak  = won ? player.streak + 1  : 0;
  const newBest    = Math.max(player.best_streak || 0, newStreak);
  const newPoints  = won ? player.points + 100 : player.points + 20;
  const newRating  = won ? player.rating + 15  : Math.max(800, player.rating - 10);
  const total      = newWins + newLosses;
  const newWinRate = total > 0 ? ((newWins / total) * 100).toFixed(2) : 0;

  const { error } = await supabase
    .from("players")
    .update({
      wins:        newWins,
      losses:      newLosses,
      streak:      newStreak,
      best_streak: newBest,
      points:      newPoints,
      rating:      newRating,
      win_rate:    newWinRate,
      [shotCol]:   (player[shotCol] || 0) + 1,
    })
    .eq("id", playerId);
  if (error) throw error;
}


// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(player1, player2, matchType = "singles") {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      player1_id:     player1.id     || null,
      player2_id:     player2.id     || null,
      player1_name:   player1.name,
      player2_name:   player2.name,
      player1_init:   player1.init,
      player2_init:   player2.init,
      player1_club:   player1.club   || "",
      player2_club:   player2.club   || "",
      player1_rating: player1.rating || 1500,
      player2_rating: player2.rating || 1500,
      match_type:     matchType,
      status:         "live",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMatch(matchId, updates) {
  const { error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", matchId);
  if (error) throw error;
}

export async function finishMatch(matchId, winner) {
  const { error } = await supabase
    .from("matches")
    .update({
      status:   "finished",
      winner,
      ended_at: new Date().toISOString(),
    })
    .eq("id", matchId);
  if (error) throw error;
}

export async function fetchMatches(limit = 20) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchLiveMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "live")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMatch(matchId) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMatchByShareCode(code) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("share_code", code.toUpperCase())
    .single();
  if (error) throw error;
  return data;
}


// ─── Match Events ─────────────────────────────────────────────────────────────

export async function saveEvent(matchId, event) {
  const { error } = await supabase
    .from("match_events")
    .insert({
      match_id:     matchId,
      game:         event.game,
      rally:        event.rally,
      scorer:       event.scorer,
      loser:        event.loser,
      shot_type:    event.shotType,
      score_before: event.scoreBefore,
      score_after:  event.scoreAfter,
      server:       event.server,
      game_won:     event.gameWon  || false,
      match_won:    event.matchWon || false,
    });
  if (error) throw error;
}

export async function fetchEvents(matchId) {
  const { data, error } = await supabase
    .from("match_events")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}


// ─── Commentary ───────────────────────────────────────────────────────────────

export async function saveCommentaryLine(matchId, line) {
  const { error } = await supabase
    .from("commentary")
    .insert({ match_id: matchId, line });
  if (error) throw error;
}

export async function fetchCommentary(matchId) {
  const { data, error } = await supabase
    .from("commentary")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data.map(r => r.line);
}


// ─── Real-time listeners ──────────────────────────────────────────────────────

// Listen to score/status changes on a specific match
export function listenToMatch(matchId, callback) {
  return supabase
    .channel(`match-${matchId}`)
    .on(
      "postgres_changes",
      {
        event:  "UPDATE",
        schema: "public",
        table:  "matches",
        filter: `id=eq.${matchId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Listen to new commentary lines for a match
export function listenToCommentary(matchId, callback) {
  return supabase
    .channel(`commentary-${matchId}`)
    .on(
      "postgres_changes",
      {
        event:  "INSERT",
        schema: "public",
        table:  "commentary",
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => callback(payload.new.line)
    )
    .subscribe();
}

// Listen to all live matches — for spectator lobby / dashboard
export function listenToLiveMatches(callback) {
  return supabase
    .channel("live-matches")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "matches" },
      () => fetchLiveMatches().then(callback)
    )
    .subscribe();
}

// Unsubscribe a channel when component unmounts
export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}