import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createPlayerProfile } from "../services/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      createProfile();
    }
  }, [user, loading]);

  async function createProfile() {
    if (!user) return;
    
    setCreatingProfile(true);
    setError("");

    try {
      const result = await createPlayerProfile(user.id, user.email);
      
      if (result.success) {
        // Profile created or already exists, redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else {
        setError(result.message);
        // Still redirect even if profile creation failed
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 3000);
      }
    } catch (err) {
      console.error("Profile creation error:", err);
      setError("Error creating profile, but you can still continue");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
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
      padding: "20px"
    }}>
      <h2>Verifying your login...</h2>
      
      {creatingProfile && (
        <>
          <p>Creating your player profile...</p>
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
          </div>
        </>
      )}

      {error && (
        <div style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "rgba(255, 107, 107, 0.2)",
          border: "1px solid #ff6b6b",
          borderRadius: "6px",
          color: "#ff6b6b",
          maxWidth: "300px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {!creatingProfile && !error && (
        <p>Redirecting to dashboard...</p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}