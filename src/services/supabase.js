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
      wins:   won ? player.wins + 1 : player.wins,
      losses: won ? player.losses   : player.losses + 1,
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

// ─── Events ─────────────────────────
export async function saveEvent(matchId, event) {
  const { error } = await supabase
    .from("match_events")
    .insert({
      match_id: matchId,
      scorer:   event.scorer,
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
    .eq("match_id", matchId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ─── Real-time Listeners ─────────────────────────
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
      (payload) => callback(payload.new)
    )
    .subscribe();
}

export function listenToLiveMatches(callback) {
  return supabase
    .channel("live-matches")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "matches", filter: `status=eq.live` },
      () => fetchMatches().then(callback)
    )
    .subscribe();
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

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}