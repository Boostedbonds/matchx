import { create } from "zustand";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

const matchRef = doc(db, "matches", "live");

const useMatchStore = create((set) => ({
  playerA: 0,
  playerB: 0,
  winner: "",

  init: () => {
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

      if (newScore >= 21 && newScore - state.playerB >= 2) {
        winner = "Player A Wins 🎉";
      }

      const updated = {
        playerA: newScore,
        playerB: state.playerB,
        winner,
      };

      setDoc(matchRef, updated);
      return updated;
    });
  },

  scoreB: async () => {
    set((state) => {
      const newScore = state.playerB + 1;
      let winner = state.winner;

      if (newScore >= 21 && newScore - state.playerA >= 2) {
        winner = "Player B Wins 🎉";
      }

      const updated = {
        playerA: state.playerA,
        playerB: newScore,
        winner,
      };

      setDoc(matchRef, updated);
      return updated;
    });
  },

  reset: async () => {
    const resetData = { playerA: 0, playerB: 0, winner: "" };
    await setDoc(matchRef, resetData);
    set(resetData);
  },
}));

export default useMatchStore;