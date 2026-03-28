// matchEngine.js
// Pure state machine for a badminton match.
// No UI dependencies — import this into MatchScorer.jsx or any other component.

// ─── Constants ────────────────────────────────────────────────────────────────

export const SHOT_TYPES = [
  { id: "smash",   label: "Smash",    icon: "💥", description: "Overhead power shot" },
  { id: "drop",    label: "Drop",     icon: "🪶", description: "Soft shot near the net" },
  { id: "net",     label: "Net",      icon: "🕸️", description: "Tight net kill/lift" },
  { id: "drive",   label: "Drive",    icon: "➡️", description: "Flat fast exchange" },
  { id: "clear",   label: "Clear",    icon: "🏹", description: "High deep shot to back" },
  { id: "lift",    label: "Lift",     icon: "⬆️", description: "Defensive underarm lift" },
  { id: "push",    label: "Push",     icon: "👋", description: "Flat push from mid-court" },
  { id: "error",   label: "Error",    icon: "❌", description: "Unforced mistake / fault" },
];

export const SHOT_IDS = SHOT_TYPES.map(s => s.id);

// Points needed to win a game (standard = 21, must win by 2, cap at 30)
const GAME_POINT_TARGET = 21;
const DEUCE_EXTEND      = 2;   // must lead by 2 after deuce
const GAME_CAP          = 30;  // sudden death at 29-all → 30 wins
const GAMES_TO_WIN      = 2;   // best of 3

// ─── Initial State Factory ────────────────────────────────────────────────────

export function createMatchState(player1, player2) {
  return {
    player1,           // { name, init, club, rating }
    player2,
    currentGame: 1,    // 1, 2, or 3
    scores: [
      { p1: 0, p2: 0 },  // game 1
      { p1: 0, p2: 0 },  // game 2
      { p1: 0, p2: 0 },  // game 3
    ],
    gamesWon: { p1: 0, p2: 0 },
    server: "p1",       // who is currently serving
    events: [],         // full event log — source of truth for stats
    commentary: [],     // generated commentary strings (latest first)
    status: "live",     // "live" | "finished"
    winner: null,       // "p1" | "p2" | null
    startTime: Date.now(),
    undoStack: [],      // snapshots for undo
  };
}

// ─── Core Reducer ─────────────────────────────────────────────────────────────

/**
 * addPoint(state, { scorer: "p1"|"p2", shotType: SHOT_IDS[n] })
 * Returns a NEW state object (immutable update).
 */
export function addPoint(state, { scorer, shotType }) {
  if (state.status === "finished") return state;

  // Save snapshot for undo BEFORE mutating
  const snapshot = deepClone(state);

  const loser      = scorer === "p1" ? "p2" : "p1";
  const gameIdx    = state.currentGame - 1;
  const newScores  = deepClone(state.scores);
  newScores[gameIdx][scorer] += 1;

  const p1Score = newScores[gameIdx].p1;
  const p2Score = newScores[gameIdx].p2;

  // Build the event
  const event = {
    id:         state.events.length + 1,
    game:       state.currentGame,
    rally:      state.events.filter(e => e.game === state.currentGame).length + 1,
    scorer,
    loser,
    shotType,
    scoreBefore:{ p1: state.scores[gameIdx].p1, p2: state.scores[gameIdx].p2 },
    scoreAfter: { p1: p1Score, p2: p2Score },
    server:     state.server,
    timestamp:  Date.now(),
  };

  // Generate commentary line
  const commentaryLine = generateCommentary(event, state.player1, state.player2);

  // Check if this game is won
  const gameWon = isGameWon(p1Score, p2Score);
  let newGamesWon  = { ...state.gamesWon };
  let newCurrentGame = state.currentGame;
  let newStatus    = "live";
  let newWinner    = null;
  let newServer    = scorer; // point scorer always serves next

  if (gameWon) {
    newGamesWon[scorer] += 1;
    event.gameWon = true;

    if (newGamesWon[scorer] >= GAMES_TO_WIN) {
      newStatus = "finished";
      newWinner = scorer;
      event.matchWon = true;
    } else {
      // Start next game — loser of last game serves first
      newCurrentGame += 1;
      newServer = loser;
    }
  }

  return {
    ...state,
    scores:      newScores,
    gamesWon:    newGamesWon,
    currentGame: newCurrentGame,
    server:      newServer,
    status:      newStatus,
    winner:      newWinner,
    events:      [...state.events, event],
    commentary:  [commentaryLine, ...state.commentary].slice(0, 50),
    undoStack:   [...state.undoStack, snapshot].slice(-20), // keep last 20
  };
}

/**
 * undoPoint(state) — rolls back one point.
 */
export function undoPoint(state) {
  if (state.undoStack.length === 0) return state;
  const prev = state.undoStack[state.undoStack.length - 1];
  // Restore snapshot but keep the undo stack trimmed
  return {
    ...prev,
    undoStack: prev.undoStack,
    commentary: ["↩️ Last point undone.", ...prev.commentary].slice(0, 50),
  };
}

// ─── Game-Won Logic ───────────────────────────────────────────────────────────

function isGameWon(p1, p2) {
  const max = Math.max(p1, p2);
  const min = Math.min(p1, p2);
  if (max < GAME_POINT_TARGET) return false;
  if (max >= GAME_CAP) return true;              // 30-29 sudden death
  return max >= GAME_POINT_TARGET && (max - min) >= DEUCE_EXTEND;
}

// ─── Stats Aggregator ─────────────────────────────────────────────────────────

/**
 * getPlayerStats(events, playerId)
 * Derives rich stats from the event log for a given player ("p1" or "p2").
 */
export function getPlayerStats(events, playerId) {
  const myPoints   = events.filter(e => e.scorer === playerId);
  const theirFaults= events.filter(e => e.loser === playerId && e.shotType === "error");
  const total      = myPoints.length;

  if (total === 0) return null;

  // Shot distribution
  const shotCounts = {};
  SHOT_IDS.forEach(s => { shotCounts[s] = 0; });
  myPoints.forEach(e => { shotCounts[e.shotType] = (shotCounts[e.shotType] || 0) + 1; });

  // Serving vs receiving points
  const servingPoints   = myPoints.filter(e => e.server === playerId).length;
  const receivingPoints = myPoints.filter(e => e.server !== playerId).length;

  // Clutch points (scored at 18+ each)
  const clutchPoints = myPoints.filter(e => {
    const s = e.scoreAfter;
    return Math.max(s.p1, s.p2) >= 18;
  }).length;

  // Consecutive max streak in this match
  let maxStreak = 0, cur = 0;
  events.forEach(e => {
    if (e.scorer === playerId) { cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  });

  // Per-game breakdown
  const games = [1, 2, 3].map(g => ({
    game: g,
    points: myPoints.filter(e => e.game === g).length,
  }));

  return {
    totalPoints:    total,
    shotCounts,
    topShot:        Object.entries(shotCounts).sort((a, b) => b[1] - a[1])[0],
    servingPoints,
    receivingPoints,
    clutchPoints,
    maxStreak,
    games,
    forcedErrors:   myPoints.filter(e => e.shotType !== "error").length,
    opponentErrors: theirFaults.length,
  };
}

// ─── Commentary Engine ────────────────────────────────────────────────────────

const TEMPLATES = {
  smash: [
    "{W} unleashes a thunderous smash! {score}",
    "SMASH! {W} goes full power — no answer from {L}.",
    "{W} jumps and hammers it down. Unstoppable! {score}",
    "What a smash from {W}! {L} had no chance.",
  ],
  drop: [
    "{W} plays a deceptive drop. {L} caught off guard. {score}",
    "Soft touch from {W} — the drop lands perfectly. {score}",
    "Beautiful drop shot from {W}, just over the tape. {score}",
    "{L} couldn't reach the drop in time. Point {W}. {score}",
  ],
  net: [
    "Tight net kill from {W}! Clinical finish. {score}",
    "{W} pounces at the net — {L} has no reply. {score}",
    "Net shot from {W} catches {L} in mid-court. {score}",
    "Quick reflexes from {W} at the net. {score}",
  ],
  drive: [
    "Flat and fast from {W}! Drive wins the rally. {score}",
    "{W} fires a searing drive past {L}. {score}",
    "Lightning-quick drive from {W}. {score}",
  ],
  clear: [
    "{W} sends a deep clear, pushing {L} back. Wins the point! {score}",
    "Attacking clear from {W} — {L} misjudges it. {score}",
    "{W} uses the full court with a perfect clear. {score}",
  ],
  lift: [
    "{W} recovers with a lift and wins the point! {score}",
    "Defensive lift from {W} pays off. {score}",
    "{L} couldn't get to the lift in time. {score}",
  ],
  push: [
    "Quick push from {W} through the gap. {score}",
    "{W} finds the line with a flat push. {score}",
    "Mid-court push from {W} — too good for {L}. {score}",
  ],
  error: [
    "{L} sends it wide — unforced error. {W} takes the point. {score}",
    "Fault from {L}! {W} capitalizes. {score}",
    "{L} can't control the shuttle — out! {score}",
    "Error from {L} gifts the point to {W}. {score}",
  ],
};

const GAME_POINT_LINES = [
  "GAME POINT for {W}!",
  "{W} is one point away from taking the game!",
  "Can {W} close it out? GAME POINT.",
];

const MATCH_POINT_LINES = [
  "MATCH POINT! {W} is one point from victory!",
  "{W} on the verge of winning the match!",
  "One point away — MATCH POINT for {W}!",
];

const GAME_WON_LINES = [
  "🏸 GAME to {W}! {score}",
  "{W} takes the game! {score}",
  "Game won by {W}! Score: {score}",
];

const MATCH_WON_LINES = [
  "🏆 MATCH WON by {W}! What a performance!",
  "{W} wins the match! Outstanding play!",
  "Victory for {W}! The match is over!",
];

function generateCommentary(event, p1, p2) {
  const winner = event.scorer === "p1" ? p1.name : p2.name;
  const loser  = event.loser  === "p1" ? p1.name : p2.name;
  const score  = `${event.scoreAfter.p1}–${event.scoreAfter.p2}`;

  const fill = (s) =>
    s.replace("{W}", winner).replace("{L}", loser).replace("{score}", score);

  // Match / game won
  if (event.matchWon) {
    return fill(pick(MATCH_WON_LINES));
  }
  if (event.gameWon) {
    return fill(pick(GAME_WON_LINES));
  }

  // Match / game point
  const s = event.scoreAfter;
  const scorerScore = event.scorer === "p1" ? s.p1 : s.p2;
  const loserScore  = event.scorer === "p1" ? s.p2 : s.p1;

  // Determine if this is a game/match point situation
  // (scorer is at >= 20 and leading, or at 29)
  const isGamePoint =
    scorerScore >= GAME_POINT_TARGET &&
    scorerScore > loserScore &&
    !isGameWon(s.p1, s.p2);

  if (isGamePoint) {
    const base = fill(pick(TEMPLATES[event.shotType] || TEMPLATES.error));
    const gp   = fill(pick(GAME_POINT_LINES));
    return `${base} ${gp}`;
  }

  const pool = TEMPLATES[event.shotType] || TEMPLATES.error;
  return fill(pick(pool));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}