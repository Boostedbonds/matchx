import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/supabase";

function Rankings({ user, onNav, onLogout }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("elo", { ascending: false });

    setPlayers(data || []);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080a0f", color: "#fff" }}>
      <Sidebar active="rankings" user={user} onNav={onNav} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 32 }}>
        <h2>🏆 Leaderboard</h2>

        <div style={{ marginTop: 20 }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                borderBottom: "1px solid #222"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <strong>#{i + 1}</strong>

                <img
                  src={p.avatar_url || "/default-avatar.png"}
                  style={{ width: 36, height: 36, borderRadius: "50%" }}
                />

                <div>
                  <div>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    {p.club || "No club"}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#00ffc8" }}>{p.elo || 1500}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {p.wins || 0}W / {p.losses || 0}L
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rankings;