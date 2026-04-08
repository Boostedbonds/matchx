/**
 * Match Completion Service for MatchX
 * Handles match resolution, ELO calculation, and data persistence
 */

import { createClient } from "@supabase/supabase-js";
import { calculateNewRatings, DEFAULT_RATING, ELOResult } from "./elo";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

export interface CompleteMatchPayload {
  match_id: string;
  winner_id: string;
  loser_id: string;
  admin_id?: string; // Optional: if admin is resolving disputed match
  admin_notes?: string;
}

export interface MatchCompletionResult {
  success: boolean;
  match_id: string;
  winner: {
    id: string;
    name: string;
    rating_before: number;
    rating_after: number;
    rating_change: number;
  };
  loser: {
    id: string;
    name: string;
    rating_before: number;
    rating_after: number;
    rating_change: number;
  };
  expected_winner_probability: number;
  timestamp: string;
  error?: string;
}

/**
 * Complete a match: calculate ELO, update ratings, save history
 */
export async function completeMatch(
  payload: CompleteMatchPayload
): Promise<MatchCompletionResult> {
  const { match_id, winner_id, loser_id, admin_id, admin_notes } = payload;

  try {
    // 1. Fetch winner and loser current ratings
    const { data: winner, error: winnerError } = await supabase
      .from("players")
      .select("id, name, elo_rating")
      .eq("id", winner_id)
      .single();

    const { data: loser, error: loserError } = await supabase
      .from("players")
      .select("id, name, elo_rating")
      .eq("id", loser_id)
      .single();

    if (winnerError || loserError || !winner || !loser) {
      throw new Error(`Failed to fetch player data: ${winnerError?.message || loserError?.message}`);
    }

    const winnerRatingBefore = winner.elo_rating || DEFAULT_RATING;
    const loserRatingBefore = loser.elo_rating || DEFAULT_RATING;

    // 2. Calculate new ELO ratings
    const eloResult: ELOResult = calculateNewRatings(
      winnerRatingBefore,
      loserRatingBefore
    );

    // 3. Update players' ratings and match stats
    const { error: updateWinnerError } = await supabase
      .from("players")
      .update({
        elo_rating: eloResult.winner_new_rating,
        matches_played: winner.matches_played || 0 + 1,
        matches_won: winner.matches_won || 0 + 1,
        rating_updated_at: new Date().toISOString(),
      })
      .eq("id", winner_id);

    const { error: updateLoserError } = await supabase
      .from("players")
      .update({
        elo_rating: eloResult.loser_new_rating,
        matches_played: loser.matches_played || 0 + 1,
        rating_updated_at: new Date().toISOString(),
      })
      .eq("id", loser_id);

    if (updateWinnerError || updateLoserError) {
      throw new Error(
        `Failed to update player ratings: ${updateWinnerError?.message || updateLoserError?.message}`
      );
    }

    // 4. Update match record
    const { error: matchUpdateError } = await supabase
      .from("matches")
      .update({
        status: "completed",
        winner_rating_before: winnerRatingBefore,
        winner_rating_after: eloResult.winner_new_rating,
        loser_rating_before: loserRatingBefore,
        loser_rating_after: eloResult.loser_new_rating,
        elo_changes: {
          winner_change: eloResult.winner_rating_change,
          loser_change: eloResult.loser_rating_change,
          expected_winner_prob: eloResult.expected_winner_win_probability,
        },
        completed_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
      })
      .eq("id", match_id);

    if (matchUpdateError) {
      throw new Error(`Failed to update match: ${matchUpdateError.message}`);
    }

    // 5. Record rating history for audit trail
    const { error: historyWinnerError } = await supabase
      .from("rating_history")
      .insert({
        player_id: winner_id,
        match_id,
        rating_before: winnerRatingBefore,
        rating_after: eloResult.winner_new_rating,
        rating_change: eloResult.winner_rating_change,
        opponent_id: loser_id,
        opponent_rating_before: loserRatingBefore,
      });

    const { error: historyLoserError } = await supabase
      .from("rating_history")
      .insert({
        player_id: loser_id,
        match_id,
        rating_before: loserRatingBefore,
        rating_after: eloResult.loser_new_rating,
        rating_change: eloResult.loser_rating_change,
        opponent_id: winner_id,
        opponent_rating_before: winnerRatingBefore,
      });

    if (historyWinnerError || historyLoserError) {
      console.warn("Failed to record rating history (non-critical)", {
        historyWinnerError,
        historyLoserError,
      });
    }

    // 6. Return success result
    return {
      success: true,
      match_id,
      winner: {
        id: winner_id,
        name: winner.name,
        rating_before: winnerRatingBefore,
        rating_after: eloResult.winner_new_rating,
        rating_change: eloResult.winner_rating_change,
      },
      loser: {
        id: loser_id,
        name: loser.name,
        rating_before: loserRatingBefore,
        rating_after: eloResult.loser_new_rating,
        rating_change: eloResult.loser_rating_change,
      },
      expected_winner_probability: eloResult.expected_winner_win_probability,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Match completion failed:", errorMessage);

    return {
      success: false,
      match_id,
      winner: {} as any,
      loser: {} as any,
      expected_winner_probability: 0,
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
}

/**
 * Void a match (revert ratings if already completed)
 * Admin only - used to cancel disputed or invalid matches
 */
export async function voidMatch(
  match_id: string,
  admin_id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch match details
    const { data: match, error: fetchError } = await supabase
      .from("matches")
      .select(
        "id, player1_id, player2_id, winner_id, status, winner_rating_after, loser_rating_after"
      )
      .eq("id", match_id)
      .single();

    if (fetchError || !match) {
      return { success: false, error: "Match not found" };
    }

    if (match.status !== "completed") {
      return { success: false, error: "Only completed matches can be voided" };
    }

    // Revert ratings (this is complex; we'd need previous ratings from history)
    // For now, mark as voided and log for manual audit
    const { error: updateError } = await supabase
      .from("matches")
      .update({
        status: "voided",
        admin_notes: `Voided by admin ${admin_id}. Reason: ${reason}`,
      })
      .eq("id", match_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    console.log(`Match ${match_id} voided by admin ${admin_id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch leaderboard with real-time updates
 */
export async function getLeaderboard(limit: number = 50) {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("*")
    .limit(limit);

  if (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }

  return data || [];
}

/**
 * Subscribe to real-time leaderboard updates
 */
export function subscribeToLeaderboard(
  callback: (leaderboard: any[]) => void
) {
  return supabase
    .from("players")
    .on("*", (payload) => {
      console.log("Rating update:", payload);
      getLeaderboard().then(callback);
    })
    .subscribe();
}