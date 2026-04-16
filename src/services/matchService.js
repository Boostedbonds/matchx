/**
 * matchService.js
 * Save to: src/services/matchService.js
 * NO TypeScript — works with .jsx projects
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

// ─── Update match status ──────────────────────────────────────────────────────
export async function updateMatchStatus(matchId, status) {
  try {
    const { error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId);

    if (error) {
      console.error("updateMatchStatus error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("updateMatchStatus unexpected:", err);
    return false;
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