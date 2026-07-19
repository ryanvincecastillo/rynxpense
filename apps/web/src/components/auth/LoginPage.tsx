"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Step = "email" | "code";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many login emails. Wait about a minute, then try again.";
  }
  return message;
}

function OtpLoginForm() {
  const params = useSearchParams();
  const rawNext = params.get("next") || "/discover";
  const next = rawNext.startsWith("/") ? rawNext : "/discover";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Add env vars to enable login.");
    }
  }, []);

  async function requestOtp() {
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: "rynxpense://login-callback",
        data: { app: "rynxpense", app_origin: "rynxpense" },
      },
    });
    if (otpError) throw new Error(friendlyAuthError(otpError.message));
    setNotice(`We sent a 6-digit code to ${email.trim()}.`);
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestOtp();
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (verifyError) {
        setError(friendlyAuthError(verifyError.message));
        setLoading(false);
        return;
      }
      window.location.assign(next);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-4">
        {notice ? <p className="text-sm text-success">{notice}</p> : null}
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
            Verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="input-field"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-sm text-muted hover:text-primary"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent py-3 font-semibold text-white disabled:opacity-70"
      >
        {loading ? "Sending…" : "Email me a code"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-border">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/brand-mark.png"
            alt="Rynxpense"
            width={56}
            height={56}
            unoptimized
            className="mb-3 rounded-[12px]"
          />
          <h1 className="text-2xl font-bold">Sign in to Rynxpense</h1>
          <p className="mt-1 text-sm text-muted">Plan trips and track your travel budget</p>
        </div>
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <OtpLoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/home" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
