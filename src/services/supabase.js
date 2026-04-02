import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Players ─────────────────────────

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

export async function updatePlayerStats(playerId, { won }) {
  const player = await fetchPlayer(playerId);
  if (!player) return;

  const { error } = await supabase
    .from("players")
    .update({
      wins: won ? player.wins + 1 : player.wins,
      losses: won ? player.losses : player.losses + 1,
    })
    .eq("id", playerId);

  if (error) throw error;
}

// ─── Matches ─────────────────────────

export async function createMatch(player1, player2) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      player1_name: player1.name,
      player2_name: player2.name,
      status: "live",
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
      status: "finished",
      winner,
    })
    .eq("id", matchId);
  if (error) throw error;
}

export async function fetchMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("created_at", { ascending: false });

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

// ─── Events ─────────────────────────

export async function saveEvent(matchId, event) {
  const { error } = await supabase
    .from("match_events")
    .insert({
      match_id: matchId,
      scorer: event.scorer,
    });
  if (error) throw error;
}

export async function fetchEvents(matchId) {
  const { data, error } = await supabase
    .from("match_events")
    .select("*")
    .eq("match_id", matchId);

  if (error) throw error;
  return data;
}

// ─── Commentary ─────────────────────────

export async function saveCommentaryLine(matchId, line) {
  const { error } = await supabase
    .from("commentary")
    .insert({
      match_id: matchId,
      line,
    });
  if (error) throw error;
}

export async function fetchCommentary(matchId) {
  const { data, error } = await supabase
    .from("commentary")
    .select("*")
    .eq("match_id", matchId);

  if (error) throw error;
  return data;
}