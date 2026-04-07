import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/supabase";

function SpectatorView({ user, onNav, onLogout }) {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [commentary, setCommentary] = useState([]);

  const [filter, setFilter] = useState("all");
  const [code, setCode] = useState("");

  const [playerProfile, setPlayerProfile] = useState(null);

  // 🔹 FETCH MATCHES
  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });

    setMatches(data || []);
    setFiltered(data || []);
  }

  // 🔹 FILTER LOGIC
  useEffect(() => {
    if (filter === "all") setFiltered(matches);
    if (filter === "live") setFiltered(matches.filter(m => m.status === "live"));
    if (filter === "completed") setFiltered(matches.filter(m => m.status === "completed"));
  }, [filter, matches]);

  // 🔹 JOIN BY CODE
  async function joinByCode() {
    if (!code) return;

    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("share_code", code)
      .single();

    if (data) openMatch(data);
    else alert("Match not found");
  }

  // 🔹 OPEN MATCH
  async function openMatch(m) {
    setSelectedMatch(m);

    setScores({
      a: m.scores?.[m.current_game - 1]?.p1 || 0,
      b: m.scores?.[m.current_game - 1]?.p2 || 0,
    });

    const { data } = await supabase
      .from("commentary")
      .select("*")
      .eq("match_id", m.id)
      .order("created_at", { ascending: false })
      .limit(15);

    setCommentary(data || []);
  }

  // 🔹 PLAYER PROFILE
  async function openPlayer(name) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("name", name)
      .single();

    if (data) setPlayerProfile(data);
  }

  // 🔹 REALTIME
  useEffect(() => {
    if (!selectedMatch?.id) return;

    const channel = supabase
      .channel("pro-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${selectedMatch.id}`,
        },
        (payload) => {
          const updated = payload.new;

          setScores({
            a: updated.scores?.[updated.current_game - 1]?.p1 || 0,
            b: updated.scores?.[updated.current_game - 1]?.p2 || 0,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "commentary",
          filter: `match_id=eq.${selectedMatch.id}`,
        },
        (payload) => {
          setCommentary(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedMatch]);

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#fff", display: "flex" }}>
      <Sidebar active="spectator" user={user} onNav={onNav} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 32 }}>

        <h2>📡 Match Feed</h2>

        {/* 🔑 JOIN BY CODE */}
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Enter Match Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={joinByCode}>Join</button>
        </div>

        {/* 🎯 FILTERS */}
        <div style={{ marginBottom: 20 }}>
          {["all", "live", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {/* 📋 MATCH LIST */}
        {!selectedMatch && (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map(m => (
              <div
                key={m.id}
                onClick={() => openMatch(m)}
                style={{
                  padding: 16,
                  background: "#111",
                  border: "1px solid #222",
                  cursor: "pointer",
                }}
              >
                <div>
                  {m.status === "live" ? "🔴 LIVE" : "✔ COMPLETED"}
                </div>

                <div style={{ fontSize: 18 }}>
                  {m.player1_name} vs {m.player2_name}
                </div>

                <div>
                  {m.score || "No score yet"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🎥 MATCH VIEW */}
        {selectedMatch && (
          <div>

            <button onClick={() => setSelectedMatch(null)}>← Back</button>

            <h3>
              <span
                style={{ cursor: "pointer", color: "#00ffc8" }}
                onClick={() => openPlayer(selectedMatch.player1_name)}
              >
                {selectedMatch.player1_name}
              </span>

              {" vs "}

              <span
                style={{ cursor: "pointer", color: "#00ffc8" }}
                onClick={() => openPlayer(selectedMatch.player2_name)}
              >
                {selectedMatch.player2_name}
              </span>
            </h3>

            <h1>{scores.a} : {scores.b}</h1>

            {/* 📢 COMMENTARY */}
            <div style={{ marginTop: 20 }}>
              <h4>Live Commentary</h4>

              {commentary.length === 0 && (
                <div style={{ opacity: 0.5 }}>No commentary yet</div>
              )}

              {commentary.map((c, i) => (
                <div key={i}>{c.text}</div>
              ))}
            </div>

            {/* 🔥 HIGHLIGHTS */}
            <div style={{ marginTop: 20 }}>
              <h4>🔥 Highlights</h4>

              {commentary
                .filter(c => c.text?.toLowerCase().includes("smash") || c.text?.toLowerCase().includes("rally"))
                .slice(0, 3)
                .map((c, i) => (
                  <div key={i} style={{ color: "#00ffc8" }}>
                    {c.text}
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* 👤 PLAYER PROFILE POPUP */}
        {playerProfile && (
          <div style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            padding: 20,
            border: "1px solid #333"
          }}>
            <h3>{playerProfile.name}</h3>
            <p>ELO: {playerProfile.elo || 1500}</p>
            <p>Club: {playerProfile.club || "N/A"}</p>

            <button onClick={() => setPlayerProfile(null)}>Close</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default SpectatorView;