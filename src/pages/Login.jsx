import { useState } from "react";
import { loginWithMagicLink } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    await loginWithMagicLink(email);
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Send Magic Link
        </button>
      </form>
    </div>
  );
}