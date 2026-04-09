import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // User authenticated, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      flexDirection: "column",
      background: "#0a0a0a",
      color: "#ffc800",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2>Verifying your login...</h2>
      <p>Please wait while we authenticate you.</p>
      <div style={{ marginTop: "20px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #ffc800",
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}