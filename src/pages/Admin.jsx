/**
 * Admin.jsx
 * Save to: src/pages/Admin.jsx
 *
 * Fixed: removed react-router-dom useNavigate — uses onNav prop instead.
 */

import { useEffect, useState } from "react";

const ADMIN_EMAIL = "katariavsk@gmail.com";

export default function Admin({ user, onNav }) {
  const [adminData, setAdminData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => {
    verifyAdmin();
  }, [user]);

  function verifyAdmin() {
    try {
      if (!user) {
        setError("Please log in first");
        setTimeout(() => onNav("dashboard"), 1500);
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        setError(`Access denied. Only ${ADMIN_EMAIL} can access admin panel.`);
        setTimeout(() => onNav("dashboard"), 2000);
        return;
      }

      setAdminData({
        email:      user.email,
        userId:     user.id,
        accessedAt: new Date().toLocaleString(),
      });
      setError("");
    } catch (err) {
      setError(err.message || "Error verifying admin access");
    } finally {
      setLoading(false);
    }
  }

  // ── Shared style objects (unchanged from original) ───────────────────────
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
      borderRadius: "8px", background: "rgba(15,15,15,0.8)",
      boxShadow: "0 0 30px rgba(255,200,0,0.15)",
    },
    h1: { fontSize: "40px", marginBottom: "10px", color: "#fff", textShadow: "0 0 20px rgba(255,200,0,0.6)", letterSpacing: "2px" },
    subtitle: { fontSize: "14px", color: "#ffc800", textShadow: "0 0 10px rgba(255,200,0,0.4)" },
    content: { maxWidth: "1200px", margin: "0 auto", display: "grid", gap: "20px" },
    card: {
      border: "1px solid rgba(255,200,0,0.2)", borderRadius: "8px",
      background: "rgba(15,15,15,0.8)", padding: "30px",
      boxShadow: "0 0 20px rgba(255,200,0,0.1)",
    },
    cardH2: {
      fontSize: "22px", marginBottom: "20px", color: "#ffc800",
      textShadow: "0 0 10px rgba(255,200,0,0.5)",
      borderBottom: "2px solid rgba(255,200,0,0.2)", paddingBottom: "15px",
    },
    infoGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "20px" },
    infoItem:   { display: "flex", flexDirection: "column", padding: "15px", background: "rgba(255,200,0,0.05)", border: "1px solid rgba(255,200,0,0.1)", borderRadius: "6px" },
    label:      { fontSize: "12px", fontWeight: "600", color: "#ffc800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" },
    actionsGrid:{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "15px" },
    actionBtn:  {
      padding: "15px 20px", background: "#ffc800", border: "none",
      color: "#0a0a0a", fontSize: "14px", fontWeight: "bold",
      letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
      borderRadius: "6px", boxShadow: "0 0 15px rgba(255,200,0,0.3)",
    },
    statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "15px" },
    statusItem: {
      display: "flex", alignItems: "center", gap: "12px",
      padding: "15px", borderRadius: "6px", fontSize: "14px", fontWeight: "500",
      background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", color: "#4caf50",
    },
    dot: { display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor" },
    loading: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#ffc800", fontFamily: "Arial, sans-serif", gap: "20px" },
    spinner: { width: "50px", height: "50px", border: "4px solid rgba(255,200,0,0.2)", borderTop: "4px solid #ffc800", borderRadius: "50%", animation: "spin 1s linear infinite" },
    errorWrap: { minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif" },
    errorBox: { textAlign: "center", padding: "40px", border: "2px solid rgba(255,107,107,0.3)", borderRadius: "8px", background: "rgba(255,107,107,0.05)" },
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

  if (!adminData) return <div style={s.loading}><p>Initializing admin panel...</p></div>;

  return (
    <div style={s.container}>
      <header style={s.header}>
        <h1 style={s.h1}>🔐 Admin Panel</h1>
        <p style={s.subtitle}>MatchX Administration Dashboard</p>
      </header>

      <div style={s.content}>
        {/* Admin Info */}
        <section style={s.card}>
          <h2 style={s.cardH2}>Admin Information</h2>
          <div style={s.infoGrid}>
            <div style={s.infoItem}><label style={s.label}>Email:</label><span>{adminData.email}</span></div>
            <div style={s.infoItem}><label style={s.label}>User ID:</label><span style={{ fontFamily: "Courier New, monospace", fontSize: "12px", color: "#999" }}>{adminData.userId?.substring(0, 16)}...</span></div>
            <div style={s.infoItem}><label style={s.label}>Access Time:</label><span>{adminData.accessedAt}</span></div>
          </div>
        </section>

        {/* Quick Actions — now use onNav instead of navigate() */}
        <section style={s.card}>
          <h2 style={s.cardH2}>Quick Actions</h2>
          <div style={s.actionsGrid}>
            <button style={s.actionBtn} onClick={() => onNav("dashboard")}>📊 Dashboard</button>
            <button style={s.actionBtn} onClick={() => onNav("players")}>👥 Players</button>
            <button style={s.actionBtn} onClick={() => onNav("rankings")}>🏆 Rankings</button>
          </div>
        </section>

        {/* System Status */}
        <section style={s.card}>
          <h2 style={s.cardH2}>System Status</h2>
          <div style={s.statusGrid}>
            {["Authentication: Active", "Database: Connected", "Admin Access: Granted"].map(label => (
              <div key={label} style={s.statusItem}><span style={s.dot} />{label}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}