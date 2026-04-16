import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);    // Supabase auth user (magic link)
  const [player,  setPlayer]  = useState(null);    // Access code player
  const [role,    setRole]    = useState("scorer"); // "scorer" | "spectator"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // 1. Check Supabase session (magic-link users)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser || null);

      // 2. Validate localStorage player against DB
      //    This prevents stale sessions from bypassing the login page on mobile
      const playerId   = localStorage.getItem("player_id");
      const playerName = localStorage.getItem("player_name");

      if (playerId && playerName) {
        const { data, error } = await supabase
          .from("players")
          .select("id, name, elo, avatar_url")
          .eq("id", playerId)
          .maybeSingle();

        if (data && !error) {
          // Valid — hydrate with fresh DB data so elo/avatar are current
          setPlayer({
            id:         data.id,
            name:       data.name,
            elo:        data.elo,
            avatar_url: data.avatar_url,
          });
        } else {
          // Stale or deleted player — clear so login page shows
          localStorage.removeItem("player_id");
          localStorage.removeItem("player_name");
          localStorage.removeItem("is_admin");
        }
      }

      // 3. Restore role from localStorage
      const savedRole = localStorage.getItem("player_role");
      if (savedRole === "spectator" || savedRole === "scorer") {
        setRole(savedRole);
      }

      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    try {
      // Clear all local state first so UI resets immediately
      localStorage.removeItem("player_id");
      localStorage.removeItem("player_name");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("player_role");
      setPlayer(null);
      setUser(null);
      setRole("scorer");

      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error("Logout error:", error.message);
      return false;
    }
  }

  function updateRole(newRole) {
    setRole(newRole);
    localStorage.setItem("player_role", newRole);
  }

  const isAuthenticated = !!user || !!player;
  const isAdmin         = localStorage.getItem("is_admin") === "true";

  return (
    <AuthContext.Provider value={{
      user,
      player,
      role,
      loading,
      logout,
      isAuthenticated,
      isAdmin,
      setPlayer,
      updateRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}