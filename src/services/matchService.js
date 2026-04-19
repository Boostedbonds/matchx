/**
 * matchService.js
 * Save to: src/services/matchService.js
 * NO TypeScript — works with .jsx projects
 *
 * FIXES IN THIS VERSION:
 *
 * FIX 1 — updateMatch now returns { success, error } instead of true/false
 *   Before: errors were logged but swallowed — caller had no way to know write failed
 *   After:  caller receives the Supabase error object for proper handling/logging
 *
 * FIX 2 — All mutating functions (finishMatch, saveEvent, updatePlayerStats)
 *   now return { success, error } consistently so callers can react to failures
 */

import { supabase } from "./supabase";

// ─── Fetch live matches ───────────────────────────────────────────────────────
export async function fetchLiveMatches() {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "live")
      .order("started_at", { ascending: false });

    if (error) {
      console.error("fetchLiveMatches error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchLiveMatches unexpected:", err);
    return [];
  }
}

// ─── Fetch recent matches ─────────────────────────────────────────────────────
export async function fetchRecentMatches(limit = 20) {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("fetchRecentMatches error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchRecentMatches unexpected:", err);
    return [];
  }
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export async function fetchDashboardStats() {
  try {
    const [liveMatches, recentMatches] = await Promise.all([
      fetchLiveMatches(),
      fetchRecentMatches(50),
    ]);

    const completedMatches = recentMatches.filter(
      (m) => m.status === "completed"
    );

    return {
      liveNow: liveMatches.length,
      totalMatches: recentMatches.length,
      completedMatches: completedMatches.length,
      season: new Date().getFullYear().toString(),
      liveMatches,
      recentMatches,
    };
  } catch (err) {
    console.error("fetchDashboardStats error:", err);
    return {
      liveNow: 0,
      totalMatches: 0,
      completedMatches: 0,
      season: new Date().getFullYear().toString(),
      liveMatches: [],
      recentMatches: [],
    };
  }
}

// ─── Subscribe to live match changes (Supabase v2 realtime) ──────────────────
export function subscribeToLiveMatches(callback) {
  const channel = supabase
    .channel("live-matches")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "matches" },
      () => {
        fetchLiveMatches().then(callback);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// ─── Create a match ───────────────────────────────────────────────────────────
export async function createMatch(matchData) {
  try {
    const { data, error } = await supabase
      .from("matches")
      .insert([{ ...matchData, status: "pending" }])
      .select()
      .single();

    if (error) {
      console.error("createMatch error:", error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("createMatch unexpected:", err);
    return null;
  }
}

// ─── Update match (scores, game state, etc.) ──────────────────────────────────
// FIX 1: Returns { success, error } so the caller (commitPoint) knows if the
// DB write actually landed. Previously returned true/false and swallowed the
// Supabase error — RLS violations were invisible, score stayed 0 in DB forever.
export async function updateMatch(matchId, updates) {
  try {
    const { error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", matchId);

    if (error) {
      console.error(
        "updateMatch error:", error.message,
        "| details:", error.details,
        "| hint:", error.hint,
        "| code:", error.code
      );
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("updateMatch unexpected:", err);
    return { success: false, error: err };
  }
}

// ─── Finish a match (set status to completed + record winner) ─────────────────
export async function finishMatch(matchId, winner) {
  try {
    const { error } = await supabase
      .from("matches")
      .update({
        status: "completed",
        winner,
        finished_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    if (error) {
      console.error(
        "finishMatch error:", error.message,
        "| code:", error.code
      );
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("finishMatch unexpected:", err);
    return { success: false, error: err };
  }
}

// ─── Save a match event (rally, point, etc.) ──────────────────────────────────
export async function saveEvent(matchId, event) {
  try {
    const { error } = await supabase
      .from("match_events")
      .insert([{ match_id: matchId, ...event }]);

    if (error) {
      console.error(
        "saveEvent error:", error.message,
        "| code:", error.code
      );
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("saveEvent unexpected:", err);
    return { success: false, error: err };
  }
}

// ─── Update player stats after a match ───────────────────────────────────────
export async function updatePlayerStats(playerId, { won, shotType }) {
  try {
    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("wins, losses, matches_played")
      .eq("id", playerId)
      .single();

    if (fetchError) {
      console.error("updatePlayerStats fetch error:", fetchError.message);
      return { success: false, error: fetchError };
    }

    const { error: updateError } = await supabase
      .from("players")
      .update({
        wins: (player.wins || 0) + (won ? 1 : 0),
        losses: (player.losses || 0) + (won ? 0 : 1),
        matches_played: (player.matches_played || 0) + 1,
      })
      .eq("id", playerId);

    if (updateError) {
      console.error("updatePlayerStats update error:", updateError.message);
      return { success: false, error: updateError };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("updatePlayerStats unexpected:", err);
    return { success: false, error: err };
  }
}

// ─── Update match status ──────────────────────────────────────────────────────
export async function updateMatchStatus(matchId, status) {
  try {
    const { error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId);

    if (error) {
      console.error("updateMatchStatus error:", error.message);
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error("updateMatchStatus unexpected:", err);
    return { success: false, error: err };
  }
}

// ─── Fetch match by ID ────────────────────────────────────────────────────────
export async function fetchMatchById(matchId) {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (error) {
      console.error("fetchMatchById error:", error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("fetchMatchById unexpected:", err);
    return null;
  }
}