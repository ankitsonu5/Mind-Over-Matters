"use client";
import "../admin.css";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/wpadmin/ui";

import { apiFetch, setToken } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setErr("");
    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      // The backend also sets an httpOnly cookie. The token is kept as a
      // fallback for when the panel is served from a different domain
      // than the API, where that cookie would not be sent.
      setToken(data.token);
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Mind Over Matter" />
          <small>Admin Panel Login</small>
        </div>
        <div className="login-box">
          <Alert>{err}</Alert>
          <div className="f-row">
            <label className="f-label">Username</label>
            <input className="f-in" value={u} onChange={(e) => setU(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="username" />
          </div>
          <div className="f-row">
            <label className="f-label">Password</label>
            <input className="f-in" type="password" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="current-password" />
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={busy} onClick={submit}>
            {busy ? "Logging in…" : "Log In"}
          </button>
        </div>
        {/* <p className="login-note">Default: admin / admin123 — create more users in the Users section; override the default via the <code>ADMIN_PASSWORD</code> env variable.</p> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
