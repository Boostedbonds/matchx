import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import {
  createMatchState,
  addPoint,
  undoPoint,
  getPlayerStats,
  SHOT_TYPES,
} from "../services/matchEngine";
import {
  createMatch,
  updateMatch,
  finishMatch,
  saveEvent,
  updatePlayerStats,
} from "../services/matchService";

// ─── Demo players ───────────────────────────────────────────────
const DEMO_P1 = { name: "Rahul Sharma", init: "RS", club: "Eagles FC", rating: 2104 };
const DEMO_P2 = { name: "Arjun Mehta",  init: "AM", club: "Smash FC",  rating: 1980 };

export default function MatchScorer({
  onNav,
  onLogout,
  user,
  onMatchUpdate,
  onMatchEnd,
  player1 = DEMO_P1,
  player2 = DEMO_P2,
}) {
  const [match, setMatch] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [shotPicker, setShotPicker] = useState(null);
  const [tab, setTab] = useState("score");
  const [flash, setFlash] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const commentaryRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const dbMatch = await createMatch({ player1, player2 });
        setMatchId(dbMatch.id);
        setShareCode(dbMatch.share_code);

        const engineState = createMatchState(player1, player2);
        setMatch(engineState);
        onMatchUpdate?.(engineState);
      } catch (err) {
        setDbError("Could not connect to Supabase.");
        const engineState = createMatchState(player1, player2);
        setMatch(engineState);
        onMatchUpdate?.(engineState);
      } finally {
        setInitialising(false);
      }
    }
    init();
  }, []);

  if (!match) return <div>Loading...</div>;

  const gIdx = match.currentGame - 1;
  const score = match.scores[gIdx];
  const isLive = match.status === "live";

  async function commitState(next, newEvent) {
    setMatch(next);
    onMatchUpdate?.(next);

    if (!matchId) return;

    try {
      const updates = {
        scores: next.scores,
        games_won: next.gamesWon,
        current_game: next.currentGame,
        server: next.server,
        status: next.status,
      };

      if (newEvent) {
        await saveEvent(matchId, newEvent);
      }

      if (next.status === "finished") {
        await finishMatch(matchId, next.winner);

        if (player1.id) {
          await updatePlayerStats(player1.id, {
            won: next.winner === "p1",
            shotType: newEvent?.shotType || "smash",
          });
        }

        if (player2.id) {
          await updatePlayerStats(player2.id, {
            won: next.winner === "p2",
            shotType: newEvent?.shotType || "smash",
          });
        }

        setTimeout(() => onMatchEnd?.(), 3000);
      } else {
        await updateMatch(matchId, updates);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handlePointTap(scorer) {
    if (!isLive) return;
    setShotPicker(scorer);
  }

  async function handleShotPick(shotType) {
    const scorer = shotPicker;
    setShotPicker(null);
    const next = addPoint(match, { scorer, shotType });
    const newEvent = next.events[next.events.length - 1];
    await commitState(next, newEvent);
  }

  async function handleUndo() {
    const prev = undoPoint(match);
    setMatch(prev);
    onMatchUpdate?.(prev);

    if (matchId) {
      try {
        await updateMatch(matchId, {
          scores: prev.scores,
          games_won: prev.gamesWon,
          current_game: prev.currentGame,
          server: prev.server,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  const p1Stats = getPlayerStats(match.events, "p1");
  const p2Stats = getPlayerStats(match.events, "p2");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar active="setup" user={user} onNav={onNav} onLogout={onLogout} />

      <div style={{ padding: 20, flex: 1 }}>
        <h2>🏸 Live Scorer</h2>

        <h3>{player1.name} vs {player2.name}</h3>
        <h1>{score.p1} - {score.p2}</h1>

        <button onClick={() => handlePointTap("p1")}>Point {player1.name}</button>
        <button onClick={() => handlePointTap("p2")}>Point {player2.name}</button>

        <button onClick={handleUndo}>Undo</button>

        {shotPicker && (
          <div>
            {SHOT_TYPES.map(s => (
              <button key={s.id} onClick={() => handleShotPick(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}