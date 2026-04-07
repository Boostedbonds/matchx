import { useState } from "react";
import { supabase } from "../services/supabase";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    if (!email) {
      alert("Enter email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    setLoading(false);

    if (error) {
      alert("Error sending email");
      return;
    }

    setSent(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#080a0f",
      color: "#fff"
    }}>
      <div style={{ width: 300 }}>

        <h2>Login</h2>

        {!sent && (
          <>
            <input
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", marginBottom: 10 }}
            />

            <button
              onClick={sendMagicLink}
              style={{ width: "100%" }}
            >
              {loading ? "Sending..." : "Send Login Link"}
            </button>
          </>
        )}

        {sent && (
          <p>📩 Check your email and click the login link</p>
        )}

      </div>
    </div>
  );
}

export default Login;