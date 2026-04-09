import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const ADMIN_EMAIL = "katariavsk@gmail.com";

  useEffect(() => {
    verifyAdmin();
  }, [user]);

  function verifyAdmin() {
    console.log("Verifying admin access...");
    console.log("Current user:", user);

    try {
      // Check if user is authenticated
      if (!user) {
        console.log("No user found");
        setError("Please log in first");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
        return;
      }

      console.log("User email:", user.email);
      console.log("Admin email:", ADMIN_EMAIL);

      // Check if user is admin
      if (user.email !== ADMIN_EMAIL) {
        console.log("User is not admin");
        setError(`Access denied. Only ${ADMIN_EMAIL} can access admin panel.`);
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
        return;
      }

      // User is admin
      console.log("Admin access granted!");
      setAdminData({
        email: user.email,
        id: user.id,
        accessedAt: new Date().toLocaleString(),
        userId: user.id
      });
      setError("");
      
    } catch (err) {
      console.error("Admin verification error:", err);
      setError(err.message || "Error verifying admin access");
    } finally {
      setLoading(false);
    }
  }

  const containerStyle = {
    minHeight: "100vh",
    background: "#0a0a0a",
    backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255, 200, 0, 0.1) 0%, transparent 50%), linear-gradient(rgba(255, 200, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 200, 0, 0.03) 1px, transparent 1px)",
    backgroundSize: "100% 100%, 40px 40px, 40px 40px",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    padding: "40px 20px"
  };

  const headerStyle = {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    textAlign: "center",
    padding: "30px",
    border: "2px solid rgba(255, 200, 0, 0.3)",
    borderRadius: "8px",
    background: "rgba(15, 15, 15, 0.8)",
    boxShadow: "0 0 30px rgba(255, 200, 0, 0.15)"
  };

  const h1Style = {
    fontSize: "40px",
    marginBottom: "10px",
    color: "#ffffff",
    textShadow: "0 0 20px rgba(255, 200, 0, 0.6)",
    letterSpacing: "2px"
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#ffc800",
    textShadow: "0 0 10px rgba(255, 200, 0, 0.4)"
  };

  const contentStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "20px"
  };

  const cardStyle = {
    border: "1px solid rgba(255, 200, 0, 0.2)",
    borderRadius: "8px",
    background: "rgba(15, 15, 15, 0.8)",
    padding: "30px",
    boxShadow: "0 0 20px rgba(255, 200, 0, 0.1)",
    transition: "all 0.3s ease"
  };

  const cardH2Style = {
    fontSize: "22px",
    marginBottom: "20px",
    color: "#ffc800",
    textShadow: "0 0 10px rgba(255, 200, 0, 0.5)",
    borderBottom: "2px solid rgba(255, 200, 0, 0.2)",
    paddingBottom: "15px"
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  };

  const infoItemStyle = {
    display: "flex",
    flexDirection: "column",
    padding: "15px",
    background: "rgba(255, 200, 0, 0.05)",
    border: "1px solid rgba(255, 200, 0, 0.1)",
    borderRadius: "6px"
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffc800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px"
  };

  const actionsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px"
  };

  const actionBtnStyle = {
    padding: "15px 20px",
    background: "#ffc800",
    border: "none",
    color: "#0a0a0a",
    fontSize: "14px",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    borderRadius: "6px",
    boxShadow: "0 0 15px rgba(255, 200, 0, 0.3)",
    transition: "all 0.3s ease"
  };

  const statusGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  };

  const statusItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    background: "rgba(76, 175, 80, 0.1)",
    border: "1px solid rgba(76, 175, 80, 0.3)",
    color: "#4caf50"
  };

  const loadingStyle = {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#ffc800",
    fontFamily: "Arial, sans-serif",
    gap: "20px"
  };

  const spinnerStyle = {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255, 200, 0, 0.2)",
    borderTop: "4px solid #ffc800",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  };

  const errorStyle = {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif"
  };

  const errorContentStyle = {
    textAlign: "center",
    padding: "40px",
    border: "2px solid rgba(255, 107, 107, 0.3)",
    borderRadius: "8px",
    background: "rgba(255, 107, 107, 0.05)"
  };

  const errorH2Style = {
    color: "#ff6b6b",
    marginBottom: "15px",
    textShadow: "0 0 15px rgba(255, 107, 107, 0.3)"
  };

  const errorPStyle = {
    color: "#999999",
    marginBottom: "10px"
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={spinnerStyle}></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <div style={errorContentStyle}>
          <h2 style={errorH2Style}>⚠️ Access Denied</h2>
          <p style={errorPStyle}>{error}</p>
          <p style={{...errorPStyle, color: "#ffc800"}}>Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div style={loadingStyle}>
        <p>Initializing admin panel...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={h1Style}>🔐 Admin Panel</h1>
        <p style={subtitleStyle}>MatchX Administration Dashboard</p>
      </header>

      <div style={contentStyle}>
        {/* Admin Info Card */}
        <section style={cardStyle}>
          <h2 style={cardH2Style}>Admin Information</h2>
          <div style={infoGridStyle}>
            <div style={infoItemStyle}>
              <label style={labelStyle}>Email:</label>
              <span>{adminData.email}</span>
            </div>
            <div style={infoItemStyle}>
              <label style={labelStyle}>User ID:</label>
              <span style={{fontFamily: "Courier New, monospace", fontSize: "12px", color: "#999999"}}>{adminData.userId.substring(0, 16)}...</span>
            </div>
            <div style={infoItemStyle}>
              <label style={labelStyle}>Access Time:</label>
              <span>{adminData.accessedAt}</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={cardStyle}>
          <h2 style={cardH2Style}>Quick Actions</h2>
          <div style={actionsGridStyle}>
            <button style={actionBtnStyle} onClick={() => navigate("/dashboard")}>
              📊 Dashboard
            </button>
            <button style={actionBtnStyle} onClick={() => navigate("/players")}>
              👥 Players
            </button>
            <button style={actionBtnStyle} onClick={() => navigate("/rankings")}>
              🏆 Rankings
            </button>
          </div>
        </section>

        {/* Status Card */}
        <section style={cardStyle}>
          <h2 style={cardH2Style}>System Status</h2>
          <div style={statusGridStyle}>
            <div style={statusItemStyle}>
              <span style={{display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor"}}></span>
              Authentication: Active
            </div>
            <div style={statusItemStyle}>
              <span style={{display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor"}}></span>
              Database: Connected
            </div>
            <div style={statusItemStyle}>
              <span style={{display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor"}}></span>
              Admin Access: Granted
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}