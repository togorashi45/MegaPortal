"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("jake@rspur.com");
  const [password, setPassword] = useState("sample123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Login failed" }))) as {
        error?: string;
      };
      setError(payload.error || "Login failed");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="login-card" onSubmit={onSubmit}>
      <p className="eyebrow">RSPUR</p>
      <h1>Sample Portal Login</h1>
      <p className="muted">Use demo credentials to access all modules.</p>

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="demo-creds">
        <p>Demo users:</p>
        <p>`jake@rspur.com` / `sample123` (SUPER_ADMIN)</p>
        <p>`ian@rspur.com` / `sample123` (ADMIN)</p>
        <p>`ava@rspur.com` / `sample123` (MEMBER)</p>
      </div>
    </form>
  );
}
