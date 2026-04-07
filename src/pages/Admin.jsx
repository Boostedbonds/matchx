import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const ADMIN_EMAIL = "katariavsk@gmail.com";

function Admin() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    checkUser();
    fetchPlayers();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user || data.user.email !== ADMIN_EMAIL) {
      alert("Access denied");
      window.location.href = "/";
    } else {
      setUser(data.user);
    }
  }

  async function fetchPlayers() {
    const { data } = await supabase.from("players").select("*");
    setPlayers(data || []);
  }

  async function deletePlayer(id) {
    await supabase.from("players").delete().eq("id", id);
    fetchPlayers();
  }

  return (
    <div style={{ padding: 40, color: "#fff", background: "#080a0f", minHeight: "100vh" }}>
      <h2>⚙ Admin Panel</h2>

      <h3>Players</h3>

      {players.map(p => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 10,
            borderBottom: "1px solid #222"
          }}
        >
          <div>
            {p.name} ({p.elo || 1500})
          </div>

          <button onClick={() => deletePlayer(p.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Admin;