"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInButton() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Add the project URL and publishable key first.");
      setBusy(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) {
      setError("Sign-in could not be completed. Check the owner credentials and try again.");
      setBusy(false);
      return;
    }
    const { data: isOwner, error: ownerError } = await supabase.rpc("is_portfolio_owner");
    if (ownerError || isOwner !== true) {
      await supabase.auth.signOut();
      setError("This account is not authorized to manage the portfolio.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return <form className="admin-form" onSubmit={(event) => void signIn(event)} style={{ marginTop: 20, maxWidth: 420 }}>
    <div className="field"><label htmlFor="owner-email">Owner email</label><input id="owner-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy}/></div>
    <div className="field"><label htmlFor="owner-password">Password</label><input id="owner-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy}/></div>
    <button className="admin-btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in as owner"}</button>
    {error && <p className="notice" role="alert">{error}</p>}
  </form>;
}
