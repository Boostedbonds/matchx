/**
 * AdminMatchPanel.tsx
 * Admin interface for completing matches and managing ELO
 */

import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { completeMatch, voidMatch } from "./matchService";

interface Match {
  id: string;
  player1_id: string;
  player1_name: string;
  player2_id: string;
  player2_name: string;
  status: "pending" | "completed" | "voided" | "disputed";
  created_at: string;
}

interface Player {
  id: string;
  name: string;
  elo_rating: number;
}

export const AdminMatchPanel: React.FC = () => {
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [winnerId, setWinnerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch pending matches
  useEffect(() => {
    fetchPendingMatches();
  }, []);

  const fetchPendingMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        player1_id,
        player2_id,
        player1:players!player1_id(id, name),
        player2:players!player2_id(id, name),
        status,
        created_at
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage({ type: "error", text: `Failed to fetch matches: ${error.message}` });
      return;
    }

    // Flatten the response
    const formatted = data?.map((m: any) => ({
      id: m.id,
      player1_id: m.player1_id,
      player1_name: m.player1?.name || "Unknown",
      player2_id: m.player2_id,
      player2_name: m.player2?.name || "Unknown",
      status: m.status,
      created_at: m.created_at,
    })) || [];

    setPendingMatches(formatted);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, elo_rating")
      .order("name");

    if (error) {
      console.error("Failed to fetch players:", error);
      return;
    }

    setPlayers(data || []);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleCompleteMatch = async () => {
    if (!selectedMatch || !winnerId) {
      setMessage({ type: "error", text: "Please select a match and winner" });
      return;
    }

    setLoading(true);

    try {
      const loserId =
        winnerId === selectedMatch.player1_id
          ? selectedMatch.player2_id
          : selectedMatch.player1_id;

      const result = await completeMatch({
        match_id: selectedMatch.id,
        winner_id: winnerId,
        loser_id: loserId,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: `Match completed! ${result.winner.name} +${result.winner.rating_change} | ${result.loser.name} ${result.loser.rating_change}`,
        });
        setSelectedMatch(null);
        setWinnerId("");
        fetchPendingMatches();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to complete match" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoidMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to void this match?")) return;

    setLoading(true);
    const result = await voidMatch(matchId, "admin-user", "Manual admin void");

    if (result.success) {
      setMessage({ type: "success", text: "Match voided successfully" });
      fetchPendingMatches();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to void match" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Match Panel</h1>

      {message.text && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: message.type === "error" ? "#ffcccc" : "#ccffcc",
            border: `1px solid ${message.type === "error" ? "red" : "green"}`,
            borderRadius: "4px",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h2>Pending Matches ({pendingMatches.length})</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "10px",
          }}
        >
          {pendingMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => {
                setSelectedMatch(match);
                setWinnerId("");
              }}
              style={{
                padding: "15px",
                border:
                  selectedMatch?.id === match.id ? "2px solid blue" : "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: selectedMatch?.id === match.id ? "#f0f0ff" : "#fff",
              }}
            >
              <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                {match.player1_name} vs {match.player2_name}
              </p>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                {new Date(match.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedMatch && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <h3>Complete Match</h3>
          <p>
            <strong>{selectedMatch.player1_name}</strong> vs{" "}
            <strong>{selectedMatch.player2_name}</strong>
          </p>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Select Winner:
            </label>
            <select
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "14px",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <option value="">-- Choose winner --</option>
              <option value={selectedMatch.player1_id}>
                {selectedMatch.player1_name}
              </option>
              <option value={selectedMatch.player2_id}>
                {selectedMatch.player2_name}
              </option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCompleteMatch}
              disabled={loading || !winnerId}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {loading ? "Completing..." : "Complete Match"}
            </button>
            <button
              onClick={() => handleVoidMatch(selectedMatch.id)}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Void Match
            </button>
            <button
              onClick={() => {
                setSelectedMatch(null);
                setWinnerId("");
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ccc",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};