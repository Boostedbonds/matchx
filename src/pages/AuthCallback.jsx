import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrUpdatePlayer } from "../services/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("Verifying login...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      handleCallback();
    }
  }, [user, loading]);

  async function handleCallback() {
    try {
      setStatus("Creating player profile...");
      setError("");

      // Create or update player profile
      const result = await createOrUpdatePlayer(user.id, user.email);
      
      console.log("Profile result:", result);

      if (result.success) {
        setStatus("✓ Authentication successful!");
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        // Show warning but still redirect
        setStatus("⚠️ Profile creation issue, but you can still continue");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error("Callback error:", err);
      setError("Error during authentication");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    }
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      flexDirection: "column",
      background: "#0a0a0a",
      color: "#ffc800",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      textAlign: "center"
    }}>
      <h2 style={{ marginBottom: "20px" }}>MatchX Authentication</h2>
      
      <div style={{
        marginBottom: "20px",
        fontSize: "16px"
      }}>
        {status}
      </div>

      <div style={{
        width: "50px",
        height: "50px",
        border: "4px solid rgba(255, 200, 0, 0.2)",
        borderTop: "4px solid #ffc800",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
      }}></div>

      {error && (
        <div style={{
          padding: "15px",
          background: "rgba(255, 107, 107, 0.2)",
          border: "1px solid #ff6b6b",
          borderRadius: "6px",
          color: "#ff6b6b",
          marginBottom: "20px",
          maxWidth: "400px"
        }}>
          {error}
        </div>
      )}

      <div style={{
        fontSize: "12px",
        color: "#666",
        marginTop: "20px"
      }}>
        Email: {user?.email}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}