import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginOrRegister, loginWithMagicLink } from "../services/auth";
import "./Login.css";

export default function Login() {
  const [activeTab, setActiveTab] = useState("code"); // "code" | "magic"
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { setPlayer } = useAuth();

  // ==============================
  // 🚀 ACCESS CODE LOGIN
  // ==============================
  async function handleAccessCodeLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await loginOrRegister(name, accessCode);

      if (result?.player) {
        const msg = result.isNew
          ? `✓ Welcome, ${result.player.name}! Profile created.`
          : `✓ Welcome back, ${result.player.name}!`;
        setMessage(msg);

        // ✅ Update AuthContext so App.jsx re-renders to Dashboard
        setPlayer({ id: result.player.id, name: result.player.name });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Access code login error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // 📧 MAGIC LINK LOGIN
  // ==============================
  async function handleMagicLinkLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await loginWithMagicLink(email);
      if (response?.success) {
        setMessage("✓ Magic link sent! Check your email.");
        setEmail("");
      } else {
        setError(response?.message || "Failed to send magic link.");
      }
    } catch (err) {
      setError(err.message || "Error sending magic link. Please try again.");
      console.error("Magic link error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-grid-overlay"></div>

      <div className="login-content">
        {/* Header */}
        <div className="login-header">
          <div className="login-label">🏸 Badminton Live Scoring Platform</div>
          <h1 className="login-title">
            MATCH<span className="login-x">X</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => { setActiveTab("code"); setError(""); setMessage(""); }}
            type="button"
          >
            ACCESS CODE
          </button>
          <button
            className={`tab-btn ${activeTab === "magic" ? "active" : ""}`}
            onClick={() => { setActiveTab("magic"); setError(""); setMessage(""); }}
            type="button"
          >
            MAGIC LINK
          </button>
        </div>

        {/* ACCESS CODE FORM */}
        {activeTab === "code" && (
          <form onSubmit={handleAccessCodeLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="name">YOUR NAME</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessCode">ACCESS CODE</label>
              <input
                id="accessCode"
                type="password"
                placeholder="••••"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-magic-link" disabled={loading}>
              {loading ? "Entering..." : "ENTER ARENA"}
            </button>

            <p className="login-hint">
              New player? Enter your name + any code to{" "}
              <strong>CREATE YOUR PROFILE</strong>
            </p>
          </form>
        )}

        {/* MAGIC LINK FORM */}
        {activeTab === "magic" && (
          <form onSubmit={handleMagicLinkLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">YOUR EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-magic-link" disabled={loading}>
              {loading ? "Sending..." : "SEND MAGIC LINK"}
            </button>

            <p className="login-hint">
              We'll send you a magic link to sign in. No password needed.
            </p>
          </form>
        )}

        {/* Messages */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Footer */}
        <div className="login-footer">
          <span className="back-link">← Back to home</span>
        </div>
      </div>
    </div>
  );
}