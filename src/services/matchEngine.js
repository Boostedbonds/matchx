// matchEngine.js
// Pure state machine for a badminton match.

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

const GAME_POINT_TARGET = 21;
const DEUCE_EXTEND      = 2;
const GAME_CAP          = 30;
const GAMES_TO_WIN      = 2;

export function createMatchState(player1, player2) {
  const openingLines = [
    `🏸 Match underway! ${player1.name} vs ${player2.name} — Game 1. ${player1.name} to serve.`,
    `⚡ We're live! ${player1.name} takes the first serve against ${player2.name}. Let's go!`,
    `🎯 Game on! ${player1.name} vs ${player2.name}. Best of 3 games. ${player1.name} serving first.`,
  ];

  return {
    player1,
    player2,
    currentGame: 1,
    scores: [
      { p1: 0, p2: 0 },
      { p1: 0, p2: 0 },
      { p1: 0, p2: 0 },
    ],
    gamesWon:    { p1: 0, p2: 0 },
    server:      "p1",
    events:      [],
    commentary:  [openingLines[Math.floor(Math.random() * openingLines.length)]],
    status:      "live",
    winner:      null,
    startTime:   Date.now(),
    undoStack:   [],
  };
}

/**
 * addPoint(state, { scorer, shotType })
 *
 * scorer = the player/team that was TAPPED in the UI.
 *
 * ── FIX: Error shot logic ─────────────────────────────────────────────────
 * When shotType === "error", the tapped player made the MISTAKE.
 * The POINT goes to the other team, not the tapped team.
 * We flip scorer/loser so the engine always works with "who WINS the point".
 */
export function addPoint(state, { scorer, shotType }) {
  if (state.status === "finished") return state;

  const snapshot = deepClone(state);

  // ── The tapped player is always who you selected in the UI.
  // For errors: tapped player = the one who made the mistake = the LOSER.
  // For all other shots: tapped player = the one who hit the winner = the SCORER.
  const isError   = shotType === "error";
  const pointWinner = isError ? (scorer === "p1" ? "p2" : "p1") : scorer;
  const pointLoser  = isError ? scorer : (scorer === "p1" ? "p2" : "p1");

  // errorBy tracks who actually made the mistake (for commentary)
  const errorBy = isError ? scorer : null;

  const gameIdx   = state.currentGame - 1;
  const newScores = deepClone(state.scores);
  newScores[gameIdx][pointWinner] += 1;  // point always goes to the WINNER

  const p1Score = newScores[gameIdx].p1;
  const p2Score = newScores[gameIdx].p2;

  const event = {
    id:          state.events.length + 1,
    game:        state.currentGame,
    rally:       state.events.filter(e => e.game === state.currentGame).length + 1,
    scorer:      pointWinner,   // who won the point
    loser:       pointLoser,    // who lost the point
    errorBy,                    // who made the error (null if not an error)
    shotType,
    scoreBefore: { p1: state.scores[gameIdx].p1, p2: state.scores[gameIdx].p2 },
    scoreAfter:  { p1: p1Score, p2: p2Score },
    server:      state.server,
    timestamp:   Date.now(),
  };

  const commentaryLine = generateCommentary(event, state.player1, state.player2);

  const gameWon = isGameWon(p1Score, p2Score);
  let newGamesWon    = { ...state.gamesWon };
  let newCurrentGame = state.currentGame;
  let newStatus      = "live";
  let newWinner      = null;
  let newServer      = pointWinner; // point winner serves next

  if (gameWon) {
    newGamesWon[pointWinner] += 1;
    event.gameWon = true;

    if (newGamesWon[pointWinner] >= GAMES_TO_WIN) {
      newStatus = "finished";
      newWinner = pointWinner;
      event.matchWon = true;
    } else {
      newCurrentGame += 1;
      newServer = pointLoser; // loser of game serves first in next game
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
    undoStack:   [...state.undoStack, snapshot].slice(-20),
  };
}

export function undoPoint(state) {
  if (state.undoStack.length === 0) return state;
  const prev = state.undoStack[state.undoStack.length - 1];
  return {
    ...prev,
    undoStack:  prev.undoStack,
    commentary: ["↩️ Last point undone.", ...prev.commentary].slice(0, 50),
  };
}

function isGameWon(p1, p2) {
  const max = Math.max(p1, p2);
  const min = Math.min(p1, p2);
  if (max < GAME_POINT_TARGET) return false;
  if (max >= GAME_CAP) return true;
  return max >= GAME_POINT_TARGET && (max - min) >= DEUCE_EXTEND;
}

export function getPlayerStats(events, playerId) {
  const myPoints    = events.filter(e => e.scorer === playerId);
  const myErrors    = events.filter(e => e.errorBy === playerId);
  const total       = myPoints.length;

  if (total === 0) return null;

  const shotCounts = {};
  SHOT_IDS.forEach(s => { shotCounts[s] = 0; });
  myPoints.forEach(e => { shotCounts[e.shotType] = (shotCounts[e.shotType] || 0) + 1; });

  const servingPoints   = myPoints.filter(e => e.server === playerId).length;
  const receivingPoints = myPoints.filter(e => e.server !== playerId).length;
  const clutchPoints    = myPoints.filter(e => Math.max(e.scoreAfter.p1, e.scoreAfter.p2) >= 18).length;

  let maxStreak = 0, cur = 0;
  events.forEach(e => {
    if (e.scorer === playerId) { cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  });

  const games = [1, 2, 3].map(g => ({
    game:   g,
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
    unforcedErrors: myErrors.length,
  };
}

// ─── Commentary ───────────────────────────────────────────────────────────────

const TEMPLATES = {
  smash: [
    "{W} unleashes a thunderous smash! {score}",
    "SMASH! {W} goes full power — no answer from {L}. {score}",
    "{W} jumps and hammers it down. Unstoppable! {score}",
    "What a smash from {W}! {L} had no chance. {score}",
  ],
  drop: [
    "{W} plays a deceptive drop. {L} caught off guard. {score}",
    "Soft touch from {W} — the drop lands perfectly. {score}",
    "Beautiful drop shot from {W}, just over the tape. {score}",
    "{L} couldn't reach the drop in time. Point to {W}. {score}",
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
  // ── FIX: Error templates now correctly say LOSER made the error ──────────
  // {E} = the player who made the error (the one who was tapped)
  // {W} = the team that benefits from the error
  error: [
    "{E} sends it wide — unforced error. {W} takes the point. {score}",
    "Fault from {E}! {W} capitalizes. {score}",
    "{E} can't control the shuttle — out! {W} gets the point. {score}",
    "Error from {E} gifts the point to {W}. {score}",
    "{E} nets it — {W} benefits from the mistake. {score}",
  ],
};

const GAME_POINT_LINES = [
  "GAME POINT for {W}!",
  "{W} is one point away from taking the game!",
  "Can {W} close it out? GAME POINT.",
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
  const winner    = event.scorer  === "p1" ? p1.name : p2.name;
  const loser     = event.loser   === "p1" ? p1.name : p2.name;
  // errorBy = the player who actually made the mistake
  const errorMaker = event.errorBy === "p1" ? p1.name : (event.errorBy === "p2" ? p2.name : loser);
  const score     = `${event.scoreAfter.p1}–${event.scoreAfter.p2}`;

  const fill = (s) =>
    s.replace(/{W}/g, winner)
     .replace(/{L}/g, loser)
     .replace(/{E}/g, errorMaker)  // {E} = error maker
     .replace(/{score}/g, score);

  if (event.matchWon) return fill(pick(MATCH_WON_LINES));
  if (event.gameWon)  return fill(pick(GAME_WON_LINES));

  const s = event.scoreAfter;
  const scorerScore = event.scorer === "p1" ? s.p1 : s.p2;
  const loserScore  = event.scorer === "p1" ? s.p2 : s.p1;

  const isGamePoint =
    scorerScore >= GAME_POINT_TARGET &&
    scorerScore > loserScore &&
    !isGameWon(s.p1, s.p2);

  const pool = TEMPLATES[event.shotType] || TEMPLATES.error;
  const base = fill(pick(pool));

  if (isGamePoint) {
    return `${base} ${fill(pick(GAME_POINT_LINES))}`;
  }

  return base;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}