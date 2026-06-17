"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

// ============================================================
// ADMIN LOGIN — replaces the old AdminGate stub
// Uses Supabase email/password sign-in. On success, middleware
// picks up the session cookie and allows /admin/* access.
// ============================================================

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-liol-bg flex flex-col items-center justify-center px-8 font-montserrat">

      <p className="text-liol-text tracking-[0.15em] font-light text-2xl">
        LIOL
      </p>
      <p className="mt-2 text-sm text-liol-subtext">
        Admin access
      </p>

      <div className="mt-10 w-full max-w-xs flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Email"
          aria-label="Email"
          className="w-full rounded-lg bg-liol-text/5 border border-liol-text/15 px-4 py-2.5 text-sm text-liol-text placeholder:text-liol-subtext outline-none focus:border-liol-text/40 duration-200"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          aria-label="Password"
          aria-invalid={!!error}
          className="w-full rounded-lg bg-liol-text/5 border border-liol-text/15 px-4 py-2.5 text-sm text-liol-text placeholder:text-liol-subtext outline-none focus:border-liol-text/40 duration-200"
        />

        {error && (
          <p role="alert" className="text-xs text-red-400">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-liol-text text-liol-bg text-sm font-medium py-2.5 hover:bg-liol-text/85 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>

    </div>
  );
}
