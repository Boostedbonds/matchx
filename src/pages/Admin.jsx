import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

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

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-content">
          <h2>⚠️ Access Denied</h2>
          <p>{error}</p>
          <p className="redirect-message">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="admin-loading">
        <p>Initializing admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🔐 Admin Panel</h1>
        <p className="admin-subtitle">MatchX Administration Dashboard</p>
      </header>

      <div className="admin-content">
        {/* Admin Info Card */}
        <section className="admin-card">
          <h2>Admin Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Email:</label>
              <span>{adminData.email}</span>
            </div>
            <div className="info-item">
              <label>User ID:</label>
              <span className="mono">{adminData.userId.substring(0, 16)}...</span>
            </div>
            <div className="info-item">
              <label>Access Time:</label>
              <span>{adminData.accessedAt}</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="admin-card">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate("/dashboard")}>
              📊 Dashboard
            </button>
            <button className="action-btn" onClick={() => navigate("/players")}>
              👥 Players
            </button>
            <button className="action-btn" onClick={() => navigate("/rankings")}>
              🏆 Rankings
            </button>
          </div>
        </section>

        {/* Status Card */}
        <section className="admin-card">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-item success">
              <span className="status-dot"></span>
              Authentication: Active
            </div>
            <div className="status-item success">
              <span className="status-dot"></span>
              Database: Connected
            </div>
            <div className="status-item success">
              <span className="status-dot"></span>
              Admin Access: Granted
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}