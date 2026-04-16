/**
 * Admin.jsx
 * src/pages/Admin.jsx
 *
 * Fixed: accepts both Supabase user (magic-link) and localStorage player (access-code).
 * Admin access is granted if: email matches ADMIN_EMAIL OR is_admin flag is set in localStorage.
 */

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const ADMIN_EMAIL = "katariavsk@gmail.com";

export default function Admin({ user, player, onNav }) {
  const [adminData,  setAdminData]  = useState(null);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => {
    verifyAndLoad();
  }, [user, player]);

  async function verifyAndLoad() {
    try {
      // Check 1: localStorage admin flag (access-code login path)
      const localAdmin = localStorage.getItem("is_admin") === "true";

      // Check 2: email match (Supabase magic-link login path)
      const emailAdmin = user?.email === ADMIN_EMAIL;

      if (!localAdmin && !emailAdmin) {
        setError("Access denied. Admin privileges required.");
        setTimeout(() => onNav("dashboard"), 2000);
        setLoading(false);
        return;
      }

      setAdminData({
        email:      user?.email || player?.name || "Admin",
        userId:     user?.id    || player?.id   || "—",
        accessedAt: new Date().toLocaleString(),
        loginType:  user?.email ? "Magic Link" : "Access Code",
      });

      // Load live stats from Supabase
      const [
        { count: playerCount },
        { count: matchCount },
        { data: topPlayers },
      ] = await Promise.all([
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*",  { count: "exact", head: true }),
        supabase.from("players").select("name, elo, wins, losses").order("elo", { ascending: false }).limit(5),
      ]);

      setStats({ playerCount, matchCount, topPlayers: topPlayers || [] });
      setError("");
    } catch (err) {
      setError(err.message || "Error verifying admin access");
    } finally {
      setLoading(false);
    }
  }

  const s = {
    container: {
      minHeight: "100vh",
      background: "#0a0a0a",
      backgroundImage:
        "radial-gradient(circle at 80% 20%, rgba(255,200,0,0.1) 0%, transparent 50%), " +
        "linear-gradient(rgba(255,200,0,0.03) 1px, transparent 1px), " +
        "linear-gradient(90deg, rgba(255,200,0,0.03) 1px, transparent 1px)",
      backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      padding: "40px 20px",
    },
    header: {
      maxWidth: "1200px", margin: "0 auto 40px", textAlign: "center",
      padding: "30px", border: "2px solid rgba(255,200,0,0.3)",
      background: "rgba(15,15,15,0.8)",
      boxShadow: "0 0 30px rgba(255,200,0,0.15)",
    },
    h1:       { fontSize: "40px", marginBottom: "10px", color: "#fff", textShadow: "0 0 20px rgba(255,200,0,0.6)", letterSpacing: "2px" },
    subtitle: { fontSize: "14px", color: "#ffc800", textShadow: "0 0 10px rgba(255,200,0,0.4)" },
    content:  { maxWidth: "1200px", margin: "0 auto", display: "grid", gap: "20px" },
    card: {
      border: "1px solid rgba(255,200,0,0.2)",
      background: "rgba(15,15,15,0.8)", padding: "30px",
      boxShadow: "0 0 20px rgba(255,200,0,0.1)",
    },
    cardH2: {
      fontSize: "22px", marginBottom: "20px", color: "#ffc800",
      textShadow: "0 0 10px rgba(255,200,0,0.5)",
      borderBottom: "2px solid rgba(255,200,0,0.2)", paddingBottom: "15px",
    },
    infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "16px" },
    infoItem: {
      display: "flex", flexDirection: "column", padding: "15px",
      background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.1)",
    },
    label: { fontSize: "11px", fontWeight: "600", color: "#ffc800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" },
    value: { fontSize: "15px", color: "#fff" },

    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "16px" },
    statBox: {
      padding: "20px", background: "rgba(255,200,0,0.04)",
      border: "1px solid rgba(255,200,0,0.15)", textAlign: "center",
    },
    statNum:   { fontSize: "42px", fontWeight: "bold", color: "#ffc800", lineHeight: 1 },
    statLabel: { fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px", marginTop: "6px" },

    actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px" },
    actionBtn: {
      padding: "14px 18px", background: "#ffc800", border: "none",
      color: "#0a0a0a", fontSize: "13px", fontWeight: "bold",
      letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
    },

    playerTable: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
    th: { textAlign: "left", padding: "10px 12px", color: "#ffc800", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,200,0,0.15)" },
    td: { padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#e0e0e0" },

    loading: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#ffc800", fontFamily: "Arial, sans-serif", gap: "20px" },
    spinner: { width: "50px", height: "50px", border: "4px solid rgba(255,200,0,0.2)", borderTop: "4px solid #ffc800", borderRadius: "50%", animation: "spin 1s linear infinite" },
    errorWrap: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" },
    errorBox: { textAlign: "center", padding: "40px", border: "2px solid rgba(255,107,107,0.3)", background: "rgba(255,107,107,0.05)" },
  };

  if (loading) return (
    <div style={s.loading}>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div style={s.spinner} />
      <p>Verifying admin access...</p>
    </div>
  );

  if (error) return (
    <div style={s.errorWrap}>
      <div style={s.errorBox}>
        <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>⚠️ Access Denied</h2>
        <p style={{ color: "#999", marginBottom: "10px" }}>{error}</p>
        <p style={{ color: "#ffc800" }}>Redirecting...</p>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>

      <header style={s.header}>
        <h1 style={s.h1}>🔐 Admin Panel</h1>
        <p style={s.subtitle}>MatchX Administration Dashboard</p>
      </header>

      <div style={s.content}>

        {/* Live Stats */}
        {stats && (
          <section style={s.card}>
            <h2 style={s.cardH2}>Live Stats</h2>
            <div style={s.statsGrid}>
              <div style={s.statBox}>
                <div style={s.statNum}>{stats.playerCount ?? "—"}</div>
                <div style={s.statLabel}>Total Players</div>
              </div>
              <div style={s.statBox}>
                <div style={s.statNum}>{stats.matchCount ?? "—"}</div>
                <div style={s.statLabel}>Total Matches</div>
              </div>
            </div>
          </section>
        )}

        {/* Admin Info */}
        <section style={s.card}>
          <h2 style={s.cardH2}>Session Info</h2>
          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <span style={s.label}>Identity</span>
              <span style={s.value}>{adminData.email}</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.label}>Login Type</span>
              <span style={s.value}>{adminData.loginType}</span>
            </div>
            <div style={s.infoItem}>
              <span style={s.label}>Access Time</span>
              <span style={s.value}>{adminData.accessedAt}</span>
            </div>
          </div>
        </section>

        {/* Top Players */}
        {stats?.topPlayers?.length > 0 && (
          <section style={s.card}>
            <h2 style={s.cardH2}>Top Players by ELO</h2>
            <table style={s.playerTable}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>ELO</th>
                  <th style={s.th}>W</th>
                  <th style={s.th}>L</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPlayers.map((p, i) => (
                  <tr key={i}>
                    <td style={{ ...s.td, color: "#ffc800" }}>{i + 1}</td>
                    <td style={s.td}>{p.name}</td>
                    <td style={{ ...s.td, color: "#00ffc8" }}>{p.elo}</td>
                    <td style={{ ...s.td, color: "#4caf50" }}>{p.wins || 0}</td>
                    <td style={{ ...s.td, color: "#ff6060" }}>{p.losses || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Quick Actions */}
        <section style={s.card}>
          <h2 style={s.cardH2}>Quick Actions</h2>
          <div style={s.actionsGrid}>
            <button style={s.actionBtn} onClick={() => onNav("dashboard")}>📊 Dashboard</button>
            <button style={s.actionBtn} onClick={() => onNav("players")}>👥 Players</button>
            <button style={s.actionBtn} onClick={() => onNav("rankings")}>🏆 Rankings</button>
            <button style={s.actionBtn} onClick={() => onNav("tournament")}>🎾 Tournament</button>
          </div>
        </section>

      </div>
    </div>
  );
}