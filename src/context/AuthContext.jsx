import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [player,  setPlayer]  = useState(null);
  const [role,    setRole]    = useState("spectator");
  const [loading, setLoading] = useState(true);

  // Tracks whether init() has already finished so the auth listener
  // doesn't race against it and double-set state.
  const initDone = useRef(false);

  useEffect(() => {
    // ── FIX 1: Race-condition guard ───────────────────────────────────────
    // onAuthStateChange can fire while init() is still awaiting getSession().
    // We set up the listener FIRST and let init() finish before it acts.
    let listenerActive = false;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only act after init() is done — avoids double-setting user on first load
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
        // ── FIX 2: Timeout wrapper on getSession() ────────────────────────
        // If Supabase network hangs, this resolves to null after 5s
        // instead of hanging forever and keeping loading=true indefinitely.
        const session = await Promise.race([
          supabase.auth.getSession().then(r => r.data.session),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)),
        ]);

        const authUser = session?.user || null;
        setUser(authUser);

        if (authUser) {
          const playerId   = localStorage.getItem("player_id");
          const playerName = localStorage.getItem("player_name");

          if (playerId && playerName) {
            // ── FIX 3: Timeout on DB fetch too ───────────────────────────
            const result = await Promise.race([
              supabase
                .from("players")
                .select("id, name, username, elo, avatar_url")
                .eq("id", playerId)
                .maybeSingle(),
              new Promise(resolve => setTimeout(() => resolve({ data: null, error: "timeout" }), 5000)),
            ]);

            const { data, error } = result;

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
          // Not authenticated — clear stale localStorage
          localStorage.removeItem("player_id");
          localStorage.removeItem("player_name");
          localStorage.removeItem("is_admin");
          localStorage.removeItem("player_role");
        }

        setRole("spectator");
      } catch (err) {
        // ── FIX 4: try/catch so ANY error still unblocks the app ─────────
        // Without this, a thrown error skips setLoading(false) entirely.
        console.error("[AuthContext] init() error:", err);
      } finally {
        // ── FIX 5: finally block guarantees loading is always cleared ─────
        // Previously setLoading(false) was only called on the happy path.
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