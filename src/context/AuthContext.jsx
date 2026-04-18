import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [player,  setPlayer]  = useState(null);
  const [role,    setRole]    = useState("spectator");
  const [loading, setLoading] = useState(true);

  const initDone = useRef(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!initDone.current) return;
      const authUser = session?.user || null;
      setUser(authUser);
      if (!authUser) {
        setPlayer(null);
        setRole("spectator");
      }
    });

    async function init() {
      try {
        const session = await Promise.race([
          supabase.auth.getSession().then(r => r.data.session),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)),
        ]);

        if (session?.user) {
          // Magic link user — real Supabase session
          setUser(session.user);
          const playerId = localStorage.getItem("player_id");
          if (playerId) {
            const { data } = await supabase
              .from("players")
              .select("id, name, elo, avatar_url")
              .eq("id", playerId)
              .maybeSingle();
            if (data) setPlayer(data);
          }
        } else {
          // Access-code user — no Supabase session, check localStorage
          const playerId   = localStorage.getItem("player_id");
          const playerName = localStorage.getItem("player_name");

          if (playerId && playerName) {
            // Set synthetic user so isAuthenticated = true
            setUser({ id: playerId, email: null, isCodeUser: true });

            const result = await Promise.race([
              supabase
                .from("players")
                .select("id, name, elo, avatar_url")
                .eq("id", playerId)
                .maybeSingle(),
              new Promise(resolve => setTimeout(() => resolve({ data: null, error: "timeout" }), 5000)),
            ]);

            if (result.data) {
              setPlayer(result.data);
            } else {
              // Stale localStorage — clear it
              localStorage.removeItem("player_id");
              localStorage.removeItem("player_name");
              localStorage.removeItem("is_admin");
              setUser(null);
            }
          }
        }

        setRole("spectator");
      } catch (err) {
        console.error("[AuthContext] init error:", err);
      } finally {
        initDone.current = true;
        setLoading(false);
      }
    }

    init();
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

  const isAuthenticated = !!user;
  const isAdmin = !!user && localStorage.getItem("is_admin") === "true";

  return (
    <AuthContext.Provider value={{
      user,
      player,
      role,
      loading,
      logout,
      isAuthenticated,
      isAdmin,
      setUser,
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