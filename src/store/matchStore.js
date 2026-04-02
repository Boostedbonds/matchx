import { create } from "zustand";
import { supabase } from "../services/supabase";

// We use a single row in the `matches` table with status = 'live'.
// On init we upsert the row and subscribe to real-time changes.

let realtimeChannel = null;

const useMatchStore = create((set, get) => ({
  matchId:   null,
  playerA:   0,
  playerB:   0,
  winner:    "",
  teamAName: "Team A",
  teamBName: "Team B",

  // ── init ──────────────────────────────────────────────────────────────────
  // Called once on MatchScene mount with team names from Setup.
  // Creates/resets the live match row and subscribes to real-time updates.
  init: async (teamAName = "Team A", teamBName = "Team B") => {
    set({ teamAName, teamBName, playerA: 0, playerB: 0, winner: "" });

    // Upsert a single "live" match row (we identify it by share_code = 'LIVE')
    const { data, error } = await supabase
      .from("matches")
      .upsert(
        {
          player1_name:  teamAName,
          player2_name:  teamBName,
          player1_init:  teamAName.substring(0, 2).toUpperCase(),
          player2_init:  teamBName.substring(0, 2).toUpperCase(),
          scores:        [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }],
          games_won:     { p1: 0, p2: 0 },
          current_game:  1,
          status:        "live",
          winner:        null,
          share_code:    "LIVE00",
        },
        { onConflict: "share_code" }
      )
      .select()
      .single();

    if (error) { console.error("init error", error); return; }

    set({ matchId: data.id });

    // Tear down any old channel
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);

    // Subscribe to real-time row changes
    realtimeChannel = supabase
      .channel("live-match")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${data.id}` },
        (payload) => {
          const row = payload.new;
          const game = row.current_game ?? 1;
          const scoreA = row.scores?.[game - 1]?.p1 ?? 0;
          const scoreB = row.scores?.[game - 1]?.p2 ?? 0;
          set({
            playerA:   scoreA,
            playerB:   scoreB,
            winner:    row.winner || "",
            teamAName: row.player1_name,
            teamBName: row.player2_name,
          });
        }
      )
      .subscribe();
  },

  // ── scoreA ────────────────────────────────────────────────────────────────
  scoreA: async () => {
    const state = get();
    const newScore = state.playerA + 1;
    const isWin = newScore >= 21 && newScore - state.playerB >= 2;
    const isMaxWin = newScore === 30;
    const winner = (isWin || isMaxWin) && !state.winner
      ? `${state.teamAName} Wins 🎉`
      : state.winner;

    // Optimistic local update
    set({ playerA: newScore, winner });

    // Fetch current scores array
    const { data: current } = await supabase
      .from("matches")
      .select("scores, current_game")
      .eq("id", state.matchId)
      .single();

    if (!current) return;
    const game = current.current_game ?? 1;
    const scores = current.scores ?? [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }];
    scores[game - 1] = { p1: newScore, p2: state.playerB };

    await supabase
      .from("matches")
      .update({ scores, winner: winner || null })
      .eq("id", state.matchId);
  },

  // ── scoreB ────────────────────────────────────────────────────────────────
  scoreB: async () => {
    const state = get();
    const newScore = state.playerB + 1;
    const isWin = newScore >= 21 && newScore - state.playerA >= 2;
    const isMaxWin = newScore === 30;
    const winner = (isWin || isMaxWin) && !state.winner
      ? `${state.teamBName} Wins 🎉`
      : state.winner;

    set({ playerB: newScore, winner });

    const { data: current } = await supabase
      .from("matches")
      .select("scores, current_game")
      .eq("id", state.matchId)
      .single();

    if (!current) return;
    const game = current.current_game ?? 1;
    const scores = current.scores ?? [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }];
    scores[game - 1] = { p1: state.playerA, p2: newScore };

    await supabase
      .from("matches")
      .update({ scores, winner: winner || null })
      .eq("id", state.matchId);
  },

  // ── reset ─────────────────────────────────────────────────────────────────
  reset: async () => {
    const state = get();
    set({ playerA: 0, playerB: 0, winner: "" });

    const { data: current } = await supabase
      .from("matches")
      .select("scores, current_game")
      .eq("id", state.matchId)
      .single();

    if (!current) return;
    const game = current.current_game ?? 1;
    const scores = current.scores ?? [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }];
    scores[game - 1] = { p1: 0, p2: 0 };

    await supabase
      .from("matches")
      .update({ scores, winner: null })
      .eq("id", state.matchId);
  },

  // ── undo ──────────────────────────────────────────────────────────────────
  undo: async (prevPlayerA, prevPlayerB) => {
    const state = get();
    set({ playerA: prevPlayerA, playerB: prevPlayerB, winner: "" });

    const { data: current } = await supabase
      .from("matches")
      .select("scores, current_game")
      .eq("id", state.matchId)
      .single();

    if (!current) return;
    const game = current.current_game ?? 1;
    const scores = current.scores ?? [{ p1: 0, p2: 0 }, { p1: 0, p2: 0 }, { p1: 0, p2: 0 }];
    scores[game - 1] = { p1: prevPlayerA, p2: prevPlayerB };

    await supabase
      .from("matches")
      .update({ scores, winner: null })
      .eq("id", state.matchId);
  },
}));

export default useMatchStore;