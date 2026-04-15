import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user (magic link)
  const [player, setPlayer] = useState(null);   // Access code player (localStorage)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Supabase session
    getUser();

    // 2. Check localStorage player session
    const playerId = localStorage.getItem("player_id");
    const playerName = localStorage.getItem("player_name");
    if (playerId && playerName) {
      setPlayer({ id: playerId, name: playerName });
    }

    // 3. Listen for Supabase auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user || null);
    setLoading(false);
  }

  async function logout() {
    try {
      // Clear localStorage player
      localStorage.removeItem("player_id");
      localStorage.removeItem("player_name");
      setPlayer(null);

      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);

      return true;
    } catch (error) {
      console.error("Logout error:", error.message);
      return false;
    }
  }

  // Either a Supabase auth user OR a localStorage player counts as "logged in"
  const isAuthenticated = !!user || !!player;

  return (
    <AuthContext.Provider value={{ user, player, loading, logout, isAuthenticated, setPlayer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}