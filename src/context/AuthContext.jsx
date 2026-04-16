import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);   // Supabase auth user (magic link)
  const [player,  setPlayer]  = useState(null);   // Access code player (localStorage)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // 1. Check Supabase session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser || null);

      // 2. Check localStorage player session (access-code login)
      const playerId   = localStorage.getItem("player_id");
      const playerName = localStorage.getItem("player_name");
      if (playerId && playerName) {
        setPlayer({ id: playerId, name: playerName });
      }

      // 3. Done — both checks complete before loading clears
      setLoading(false);
    }

    init();

    // Listen for Supabase auth changes (magic link callback etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    try {
      localStorage.removeItem("player_id");
      localStorage.removeItem("player_name");
      localStorage.removeItem("is_admin");
      setPlayer(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error.message);
      // Even if Supabase signOut fails, clear local state
      setUser(null);
      return false;
    }
  }

  // Either a Supabase auth user OR a localStorage player counts as logged in
  const isAuthenticated = !!user || !!player;
  const isAdmin         = localStorage.getItem("is_admin") === "true";

  return (
    <AuthContext.Provider value={{
      user,
      player,
      loading,
      logout,
      isAuthenticated,
      isAdmin,
      setPlayer,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}