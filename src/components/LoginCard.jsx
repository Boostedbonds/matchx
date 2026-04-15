import { useState } from "react";
import { loginOrRegister, loginWithMagicLink } from "../services/auth";
import "./LoginCard.css";

export default function LoginCard() {
  const [mode, setMode] = useState("code");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [smashing, setSmashing] = useState(false);

  function triggerSmash() {
    setSmashing(true);
    setTimeout(() => setSmashing(false), 600);
  }

  async function handleCodeLogin() {
    const trimName = name.trim();
    const trimCode = code.trim();

    if (!trimName) { setError("Please enter your name."); return; }
    if (!trimCode) { setError("Please enter your access code."); return; }

    setError("");
    setSuccess("");
    setLoading(true);
    triggerSmash();

    try {
      const { player, isNew } = await loginOrRegister(trimName, trimCode);
      setSuccess(isNew ? "✓ Profile created! Entering arena..." : "✓ Welcome back! Entering arena...");
      setName("");
      setCode("");
      setTimeout(() => window.location.href = "/dashboard", 1500);
    } catch (err) {
      setError(err.message || "Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    const trimEmail = email.trim();

    if (!trimEmail) { setError("Please enter your email."); return; }
    if (!trimEmail.includes("@")) { setError("Please enter a valid email address."); return; }

    setError("");
    setSuccess("");
    setLoading(true);
    triggerSmash();

    try {
      const response = await loginWithMagicLink(trimEmail);
      if (response?.success) {
        setSuccess("✓ Magic link sent! Check your email");
        setEmail("");
        setTimeout(() => { setSuccess(""); setEmail(""); }, 5000);
      } else {
        setError(response?.message || "Failed to send magic link");
      }
    } catch (err) {
      setError(err.message || "Error sending magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !loading) {
      mode === "code" ? handleCodeLogin() : handleEmailLogin();
    }
  }

  return (
    <div className={`login-card ${smashing ? "smashing" : ""}`}>

      {/* Tabs */}
      <div className="login-tabs">
        <button
          className={`tab ${mode === "code" ? "active" : ""}`}
          onClick={() => { setMode("code"); setError(""); setSuccess(""); }}
          disabled={loading}
        >
          Access Code
        </button>
        <button
          className={`tab ${mode === "email" ? "active" : ""}`}
          onClick={() => { setMode("email"); setError(""); setSuccess(""); }}
          disabled={loading}
        >
          Magic Link
        </button>
      </div>

      {/* Access Code Mode */}
      {mode === "code" && (
        <div className="tab-content code-mode">
          <div className="input-group">
            <label className="input-label">Your Name</label>
            <input
              className="input-field"
              placeholder="Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Access Code</label>
            <input
              className="input-field"
              placeholder="Enter Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKey}
              type="password"
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <button
            className={`submit-btn ${smashing ? "smashing" : ""}`}
            onClick={handleCodeLogin}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Enter Arena"}
          </button>
          <div className="hint-text">
            New player? Enter your name + any code to <span>create your profile</span>
          </div>
        </div>
      )}

      {/* Magic Link Mode */}
      {mode === "email" && (
        <div className="tab-content email-mode">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="input-field"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              type="email"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <button
            className={`submit-btn ${smashing ? "smashing" : ""}`}
            onClick={handleEmailLogin}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
          <div className="hint-text">
            We'll send you a link to sign in. <span>No password needed</span>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && <div className="message-box error-msg">{error}</div>}
      {success && <div className="message-box success-msg">{success}</div>}
    </div>
  );
}