// src/utils/supabase.js
// Single source of truth for all Supabase interactions.
// Import { db } and call helpers — never call supabase directly from components.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://afecdlzqmrotkoovazlc.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZWNkbHpxbXJvdGtvb3ZhemxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjEzNjUsImV4cCI6MjA5MDI5NzM2NX0.ZoJVVvCNnGqBRZgIgiPvSu5g4ZqYAEOMvOWljiIn-wg";

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
  // Fetch current stats first
  const player = await fetchPlayer(playerId);
  if (!player) return;

  const shotCol = `${shotType}_count`;
  const updates = {
    wins:    won ? player.wins + 1    : player.wins,
    losses:  won ? player.losses      : player.losses + 1,
    points:  won ? player.points + 100 : player.points + 20,
    rating:  won ? player.rating + 15  : player.rating - 10,
    [shotCol]: (player[shotCol] || 0) + 1,
  };

  const { error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", playerId);
  if (error) throw error;
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(player1, player2) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      player1_id:   player1.id   || null,
      player2_id:   player2.id   || null,
      player1_name: player1.name,
      player2_name: player2.name,
      player1_init: player1.init,
      player2_init: player2.init,
      player1_club: player1.club || "",
      player2_club: player2.club || "",
      status:       "live",
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

// Listen to a specific live match — fires whenever scores/status changes
export function listenToMatch(matchId, callback) {
  return supabase
    .channel(`match-${matchId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Listen to commentary lines for a match — fires on every new line
export function listenToCommentary(matchId, callback) {
  return supabase
    .channel(`commentary-${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "commentary", filter: `match_id=eq.${matchId}` },
      (payload) => callback(payload.new.line)
    )
    .subscribe();
}

// Listen to all live matches — for dashboard / spectator lobby
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

// Unsubscribe a channel
export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}