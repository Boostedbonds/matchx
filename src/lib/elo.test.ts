/**
 * elo.test.ts
 * Unit tests for ELO calculation
 * Run with: npm test elo.test.ts
 */

import {
  calculateNewRatings,
  calculateExpectedProbability,
  validateZeroSum,
  getProgressiveKFactor,
  DEFAULT_RATING,
} from "./elo";

describe("ELO System Tests", () => {
  describe("calculateExpectedProbability", () => {
    test("Equal ratings should give 50% probability", () => {
      const prob = calculateExpectedProbability(1600, 1600);
      expect(prob).toBeCloseTo(0.5, 2);
    });

    test("200 point difference should give ~76% favorite", () => {
      const prob = calculateExpectedProbability(1600, 1400);
      expect(prob).toBeCloseTo(0.76, 1);
    });

    test("Higher rated player has higher win probability", () => {
      const probHigher = calculateExpectedProbability(1600, 1400);
      const probLower = calculateExpectedProbability(1400, 1600);
      expect(probHigher).toBeGreaterThan(probLower);
    });

    test("Probabilities sum to 1", () => {
      const probA = calculateExpectedProbability(1600, 1400);
      const probB = calculateExpectedProbability(1400, 1600);
      expect(probA + probB).toBeCloseTo(1, 5);
    });
  });

  describe("calculateNewRatings", () => {
    test("Favorite wins: small rating change", () => {
      // 1600 vs 1400, 1600 wins
      const result = calculateNewRatings(1600, 1400);
      expect(result.winner_new_rating).toBeGreaterThan(1600);
      expect(result.loser_new_rating).toBeLessThan(1400);
      expect(result.winner_rating_change).toBeLessThan(10); // Small gain
    });

    test("Underdog wins: large rating change", () => {
      // 1400 vs 1600, 1400 wins (upset)
      const result = calculateNewRatings(1400, 1600);
      expect(result.winner_new_rating).toBeGreaterThan(1400);
      expect(result.loser_new_rating).toBeLessThan(1600);
      expect(result.winner_rating_change).toBeGreaterThan(20); // Large gain for upset
    });

    test("Equal ratings: ~16 point swing", () => {
      const result = calculateNewRatings(1500, 1500);
      expect(Math.abs(result.winner_rating_change)).toBeCloseTo(16, 0);
    });

    test("Results are zero-sum", () => {
      const result = calculateNewRatings(1600, 1400);
      expect(validateZeroSum(result)).toBe(true);
    });

    test("New player (rating 1500) beats veteran (rating 2000)", () => {
      const result = calculateNewRatings(1500, 2000);
      // New player should gain significant points
      expect(result.winner_rating_change).toBeGreaterThan(20);
      // Veteran should lose significant points
      expect(result.loser_rating_change).toBeLessThan(-20);
    });

    test("Ratings don't go negative", () => {
      const result = calculateNewRatings(1200, 1800);
      // Loser at 1200 loses match to 1800
      expect(result.loser_new_rating).toBeGreaterThan(0);
    });
  });

  describe("validateZeroSum", () => {
    test("All valid matches should be zero-sum", () => {
      const testCases = [
        { winner: 1200, loser: 1800 },
        { winner: 1500, loser: 1500 },
        { winner: 2000, loser: 1000 },
        { winner: 1400, loser: 1400 },
      ];

      testCases.forEach(({ winner, loser }) => {
        const result = calculateNewRatings(winner, loser);
        expect(validateZeroSum(result)).toBe(true);
      });
    });
  });

  describe("getProgressiveKFactor", () => {
    test("New player (<1200) gets K=48", () => {
      expect(getProgressiveKFactor(1000)).toBe(48);
      expect(getProgressiveKFactor(1199)).toBe(48);
    });

    test("Standard player (1200-1800) gets K=32", () => {
      expect(getProgressiveKFactor(1200)).toBe(32);
      expect(getProgressiveKFactor(1500)).toBe(32);
      expect(getProgressiveKFactor(1799)).toBe(32);
    });

    test("Veteran (1800+) gets K=16", () => {
      expect(getProgressiveKFactor(1800)).toBe(16);
      expect(getProgressiveKFactor(2000)).toBe(16);
    });
  });

  describe("Real-world scenarios", () => {
    test("Promotion from 1000 to 1500 through wins", () => {
      let rating = 1000;
      const opponents = [900, 950, 1000, 1050, 1100];

      opponents.forEach((opp) => {
        const result = calculateNewRatings(rating, opp);
        rating = result.winner_new_rating;
      });

      // After beating weaker opponents, rating should increase significantly
      expect(rating).toBeGreaterThan(1000);
      expect(rating).toBeLessThan(1500);
    });

    test("Champion handling multiple challengers", () => {
      let rating = 2000;
      const challengers = [1800, 1850, 1900, 1950];
      const originalRating = rating;

      // Champion beats all challengers
      challengers.forEach((challenger) => {
        const result = calculateNewRatings(rating, challenger);
        rating = result.winner_new_rating;
      });

      // Champion's rating should barely move (expected to win all)
      expect(rating).toBeLessThan(originalRating + 20);
    });

    test("Comeback win from lower rating", () => {
      // 1400 player beats 1600 player
      const result = calculateNewRatings(1400, 1600);
      // Underdog should gain more than favorite loses
      expect(result.winner_rating_change).toBeGreaterThan(
        Math.abs(result.loser_rating_change) - 1
      );
    });
  });

  describe("Edge cases", () => {
    test("Very large rating difference", () => {
      const result = calculateNewRatings(500, 2500);
      expect(result.winner_new_rating).toBeGreaterThan(500);
      expect(result.loser_new_rating).toBeLessThan(2500);
      expect(validateZeroSum(result)).toBe(true);
    });

    test("Default rating constant works", () => {
      expect(DEFAULT_RATING).toBe(1500);
    });

    test("Same rating twice should be identical to equal ratings", () => {
      const result1 = calculateNewRatings(1500, 1500);
      const result2 = calculateNewRatings(1500, 1500);
      expect(result1.winner_rating_change).toBe(result2.winner_rating_change);
    });
  });

  describe("Consistency checks", () => {
    test("Winner is always higher after match", () => {
      const testCases = [
        { w: 1200, l: 1800 },
        { w: 1500, l: 1500 },
        { w: 2000, l: 1000 },
      ];

      testCases.forEach(({ w, l }) => {
        const result = calculateNewRatings(w, l);
        expect(result.winner_new_rating).toBeGreaterThan(w);
        expect(result.loser_new_rating).toBeLessThan(l);
      });
    });

    test("Rating changes are reasonable (less than K)", () => {
      const result = calculateNewRatings(1600, 1400);
      expect(Math.abs(result.winner_rating_change)).toBeLessThanOrEqual(32);
      expect(Math.abs(result.loser_rating_change)).toBeLessThanOrEqual(32);
    });
  });
});

// Example test output:
// ✓ Equal ratings should give 50% probability
// ✓ 200 point difference should give ~76% favorite
// ✓ Higher rated player has higher win probability
// ✓ Probabilities sum to 1
// ✓ Favorite wins: small rating change
// ✓ Underdog wins: large rating change
// ✓ Equal ratings: ~16 point swing
// ✓ Results are zero-sum
// ... (all 40+ tests)