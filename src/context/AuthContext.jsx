import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [player,  setPlayer]  = useState(null);
  const [role,    setRole]    = useState("spectator");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // ── FIX 1: Check Supabase auth session properly ──────────────────────
      // Previously this could resolve a stale/null session and still show dashboard
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user || null;
      setUser(authUser);

      if (authUser) {
        // Only load player profile if actually authenticated
        const playerId   = localStorage.getItem("player_id");
        const playerName = localStorage.getItem("player_name");

        if (playerId && playerName) {
          const { data, error } = await supabase
            .from("players")
            .select("id, name, username, elo, avatar_url")
            .eq("id", playerId)
            .maybeSingle();

          if (data && !error) {
            setPlayer({
              id:         data.id,
              name:       data.name,
              username:   data.username,
              elo:        data.elo,
              avatar_url: data.avatar_url,
            });
          } else {
            localStorage.removeItem("player_id");
            localStorage.removeItem("player_name");
            localStorage.removeItem("is_admin");
          }
        }
      } else {
        // Not authenticated — clear any stale localStorage
        localStorage.removeItem("player_id");
        localStorage.removeItem("player_name");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("player_role");
      }

      // Always start as spectator — scorer role is granted per-match only
      setRole("spectator");
      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user || null;
      setUser(authUser);
      // If user logs out via another tab, clear player too
      if (!authUser) {
        setPlayer(null);
        setRole("spectator");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    try {
      localStorage.removeItem("player_id");
      localStorage.removeItem("player_name");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("player_role");
      setPlayer(null);
      setUser(null);
      setRole("spectator");
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

  // ── FIX: isAuthenticated must require a real Supabase session ─────────────
  // Previously: !!user || !!player — player from localStorage made it always true
  // Now: only a real auth session counts
  const isAuthenticated = !!user;
  const isAdmin         = !!user && localStorage.getItem("is_admin") === "true";

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