import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [player,  setPlayer]  = useState(null);
  const [role,    setRole]    = useState("spectator"); // ✅ default spectator
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser || null);

      const playerId   = localStorage.getItem("player_id");
      const playerName = localStorage.getItem("player_name");
      if (playerId && playerName) {
        const { data, error } = await supabase
          .from("players")
          .select("id, name, elo, avatar_url")
          .eq("id", playerId)
          .maybeSingle();
        if (data && !error) {
          setPlayer({
            id:         data.id,
            name:       data.name,
            elo:        data.elo,
            avatar_url: data.avatar_url,
          });
        } else {
          localStorage.removeItem("player_id");
          localStorage.removeItem("player_name");
          localStorage.removeItem("is_admin");
        }
      }

      // ✅ Only restore "spectator" from localStorage — never auto-restore scorer
      // scorer role is granted per-match only
      const savedRole = localStorage.getItem("player_role");
      if (savedRole === "spectator") {
        setRole("spectator");
      }
      // always start as spectator regardless of what was saved

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
      localStorage.removeItem("player_id");
      localStorage.removeItem("player_name");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("player_role");
      setPlayer(null);
      setUser(null);
      setRole("spectator"); // ✅ reset to spectator on logout
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