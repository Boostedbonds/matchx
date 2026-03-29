import { create } from "zustand";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

const matchRef = doc(db, "matches", "live");

const useMatchStore = create((set, get) => ({
  playerA: 0,
  playerB: 0,
  winner: "",
  teamAName: "Team A",
  teamBName: "Team B",

  // Call once on mount with team names from matchData
  init: (teamAName = "Team A", teamBName = "Team B") => {
    set({ teamAName, teamBName });
    onSnapshot(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        set(snapshot.data());
      }
    });
  },

  scoreA: async () => {
    set((state) => {
      const newScore = state.playerA + 1;
      let winner = state.winner;
      const isWin =
        newScore >= 21 &&
        newScore - state.playerB >= 2 &&
        newScore <= 30;
      const isMaxWin = newScore === 30;
      if ((isWin || isMaxWin) && !winner) {
        winner = `${state.teamAName} Wins 🎉`;
      }
      const updated = { playerA: newScore, playerB: state.playerB, winner, teamAName: state.teamAName, teamBName: state.teamBName };
      setDoc(matchRef, updated);
      return updated;
    });
  },

  scoreB: async () => {
    set((state) => {
      const newScore = state.playerB + 1;
      let winner = state.winner;
      const isWin =
        newScore >= 21 &&
        newScore - state.playerA >= 2 &&
        newScore <= 30;
      const isMaxWin = newScore === 30;
      if ((isWin || isMaxWin) && !winner) {
        winner = `${state.teamBName} Wins 🎉`;
      }
      const updated = { playerA: state.playerA, playerB: newScore, winner, teamAName: state.teamAName, teamBName: state.teamBName };
      setDoc(matchRef, updated);
      return updated;
    });
  },

  reset: async () => {
    const state = get();
    const resetData = {
      playerA: 0,
      playerB: 0,
      winner: "",
      teamAName: state.teamAName,
      teamBName: state.teamBName,
    };
    await setDoc(matchRef, resetData);
    set(resetData);
  },
}));

export default useMatchStore;