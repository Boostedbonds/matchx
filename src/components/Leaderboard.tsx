/**
 * Leaderboard.tsx
 * Real-time leaderboard with live ELO ratings
 */

import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  win_rate: number;
  rating_updated_at: string;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .from("players")
      .on("*", (payload) => {
        // Refresh leaderboard when any player is updated
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("*")
      .limit(100);

    if (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLoading(false);
      return;
    }

    const formatted = data?.map((entry: any) => ({
      id: entry.id,
      rank: entry.rank,
      name: entry.name,
      elo_rating: entry.elo_rating,
      matches_played: entry.matches_played,
      matches_won: entry.matches_won,
      win_rate: entry.win_rate || 0,
      rating_updated_at: entry.rating_updated_at,
    })) || [];

    setLeaderboard(formatted);
    setLoading(false);
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 2000) return "#FFD700"; // Gold
    if (rating >= 1800) return "#C0C0C0"; // Silver
    if (rating >= 1600) return "#CD7F32"; // Bronze
    if (rating >= 1400) return "#4CAF50"; // Green
    return "#9E9E9E"; // Gray
  };

  const filteredLeaderboard =
    filter === "active"
      ? leaderboard.filter((entry) => entry.matches_played >= 5)
      : leaderboard;

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading leaderboard...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>🏆 Leaderboard</h1>
        <div>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              marginRight: "8px",
              backgroundColor: filter === "all" ? "#2196F3" : "#ddd",
              color: filter === "all" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            All Players ({leaderboard.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "active" ? "#2196F3" : "#ddd",
              color: filter === "active" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Active (5+ matches)
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #ddd",
              }}
            >
              <th style={tableHeaderStyle}>Rank</th>
              <th style={tableHeaderStyle}>Player</th>
              <th style={tableHeaderStyle}>Rating</th>
              <th style={tableHeaderStyle}>Matches</th>
              <th style={tableHeaderStyle}>Won</th>
              <th style={tableHeaderStyle}>Win Rate</th>
              <th style={tableHeaderStyle}>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.map((entry, index) => (
              <tr
                key={entry.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #eee",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#f0f0f0" : "#efefef")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#fff" : "#f9f9f9")
                }
              >
                <td style={tableCellStyle}>
                  <strong
                    style={{
                      fontSize: "18px",
                      color: getRatingColor(entry.elo_rating),
                    }}
                  >
                    {entry.rank}
                  </strong>
                </td>
                <td style={tableCellStyle}>
                  <strong>{entry.name}</strong>
                </td>
                <td style={tableCellStyle}>
                  <span
                    style={{
                      padding: "4px 8px",
                      backgroundColor: getRatingColor(entry.elo_rating),
                      color: entry.elo_rating >= 2000 ? "black" : "white",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {entry.elo_rating}
                  </span>
                </td>
                <td style={tableCellStyle}>{entry.matches_played}</td>
                <td style={tableCellStyle}>{entry.matches_won}</td>
                <td style={tableCellStyle}>
                  <strong
                    style={{
                      color: entry.win_rate >= 50 ? "#4CAF50" : "#f44336",
                    }}
                  >
                    {entry.win_rate.toFixed(1)}%
                  </strong>
                </td>
                <td
                  style={{
                    ...tableCellStyle,
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {new Date(entry.rating_updated_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Rating System</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>
            <span style={{ color: "#FFD700", fontWeight: "bold" }}>2000+</span>{" "}
            – Grandmaster
          </li>
          <li>
            <span style={{ color: "#C0C0C0", fontWeight: "bold" }}>1800-1999</span>{" "}
            – Master
          </li>
          <li>
            <span style={{ color: "#CD7F32", fontWeight: "bold" }}>1600-1799</span>{" "}
            – Expert
          </li>
          <li>
            <span style={{ color: "#4CAF50", fontWeight: "bold" }}>1400-1599</span>{" "}
            – Intermediate
          </li>
          <li>
            <span style={{ color: "#9E9E9E", fontWeight: "bold" }}&lt;1400</span>{" "}
            – Beginner
          </li>
        </ul>
      </div>
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold",
  color: "#333",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
};