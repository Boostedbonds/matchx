/**
 * ELO Rating System for MatchX
 * Standard K-factor competitive rating system
 */

export interface ELOResult {
  winner_new_rating: number;
  loser_new_rating: number;
  winner_rating_change: number;
  loser_rating_change: number;
  expected_winner_win_probability: number;
}

// K-factor: controls rating volatility
// 32 = standard (chess), 16 = less volatile, 48 = more volatile
const K_FACTOR = 32;

// Default rating for new players
export const DEFAULT_RATING = 1500;

/**
 * Calculate expected win probability using ELO formula
 * P(A wins) = 1 / (1 + 10^((Rb - Ra) / 400))
 */
export function calculateExpectedProbability(
  ratingA: number,
  ratingB: number
): number {
  const difference = ratingB - ratingA;
  const exponent = difference / 400;
  return 1 / (1 + Math.pow(10, exponent));
}

/**
 * Calculate new ratings after a match
 * @param winnerRating - Rating of the winner before match
 * @param loserRating - Rating of the loser before match
 * @param kFactor - Optional custom K-factor (default 32)
 * @returns New ratings and rating changes
 */
export function calculateNewRatings(
  winnerRating: number,
  loserRating: number,
  kFactor: number = K_FACTOR
): ELOResult {
  // Expected win probability for winner (should be < 0.5 if upset, > 0.5 if favored)
  const expectedWinnerProb = calculateExpectedProbability(winnerRating, loserRating);
  const expectedLoserProb = 1 - expectedWinnerProb;

  // Winner gained points (actual result = 1, expected = expectedWinnerProb)
  const winnerRatingChange = kFactor * (1 - expectedWinnerProb);

  // Loser lost points (actual result = 0, expected = expectedLoserProb)
  const loserRatingChange = kFactor * (0 - expectedLoserProb);

  return {
    winner_new_rating: Math.round(winnerRating + winnerRatingChange),
    loser_new_rating: Math.round(loserRating + loserRatingChange),
    winner_rating_change: Math.round(winnerRatingChange),
    loser_rating_change: Math.round(loserRatingChange),
    expected_winner_win_probability: expectedWinnerProb,
  };
}

/**
 * Validate ELO calculation (used in tests/audits)
 * Sum of rating changes should be 0 (zero-sum)
 */
export function validateZeroSum(result: ELOResult): boolean {
  const sum = result.winner_rating_change + result.loser_rating_change;
  return Math.abs(sum) < 1; // Allow tiny rounding error
}

/**
 * Get K-factor based on player rating (optional progressive system)
 * Higher K for newer/lower-rated players, lower K for veterans
 * This encourages more movement at lower ratings and stability at high ratings
 */
export function getProgressiveKFactor(currentRating: number): number {
  if (currentRating < 1200) return 48; // New players: faster rating movement
  if (currentRating < 1800) return 32; // Standard: moderate movement
  return 16; // Veterans: stable ratings
}

/**
 * Batch calculate ratings for multiple matches
 * Useful for bulk operations or recalculations
 */
export function calculateBatchRatings(
  matches: Array<{ winner_rating: number; loser_rating: number }>
): ELOResult[] {
  return matches.map((match) =>
    calculateNewRatings(match.winner_rating, match.loser_rating)
  );
}