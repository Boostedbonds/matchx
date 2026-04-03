// src/utils/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);


// ─── Auth / Login ─────────────────────────────────────────────────────────────

/**
 * loginPlayer(name, accessCode)
 * Looks up a player by name + access code.
 * Returns the player row if found, null if not found, throws on DB error.
 */
export async function loginPlayer(name, accessCode) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .ilike("name", name.trim())           // case-insensitive name match
    .eq("access_code", accessCode.trim().toUpperCase())
    .single();

  if (error && error.code === "PGRST116") return null; // no rows found
  if (error) throw error;
  return data;
}

/**
 * registerPlayer(name, accessCode)
 * Creates a new player row with default stats.
 * Derives initials from name automatically.
 */
export async function registerPlayer(name, accessCode) {
  const trimmed = name.trim();

  // Build initials — "Rahul Sharma" → "RS", "Priya" → "PR"
  const parts = trimmed.split(" ").filter(Boolean);
  const init  = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : trimmed.slice(0, 2).toUpperCase();

  const { data, error } = await supabase
    .from("players")
    .insert({
      name:        trimmed,
      init,
      club:        "",
      rating:      1500,
      wins:        0,
      losses:      0,
      points:      0,
      streak:      0,
      best_streak: 0,
      win_rate:    0,
      access_code: accessCode.trim().toUpperCase(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * loginOrRegister(name, accessCode)
 * If player exists with that name + code → load their stats.
 * If name exists but wrong code → throw "Wrong access code".
 * If name doesn't exist → create new player with that code.
 */
export async function loginOrRegister(name, accessCode) {
  const trimmedName = name.trim();
  const trimmedCode = accessCode.trim().toUpperCase();

  // First check if name exists at all
  const { data: existing } = await supabase
    .from("players")
    .select("id, name, access_code")
    .ilike("name", trimmedName)
    .maybeSingle();

  if (existing) {
    // Name exists — verify the code
    if (existing.access_code !== trimmedCode) {
      throw new Error("Wrong access code for this player.");
    }
    // Code matches — fetch full profile
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", existing.id)
      .single();
    if (error) throw error;
    return { player: data, isNew: false };
  }

  // Name doesn't exist — create new player
  const newPlayer = await registerPlayer(trimmedName, trimmedCode);
  return { player: newPlayer, isNew: true };
}


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

  const shotCol    = `${shotType}_count`;
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

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}