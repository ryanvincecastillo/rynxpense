"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, Sparkles } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="waitlist" className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-text sm:text-3xl">
          Ready to plan your next adventure?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          The app is live and free to use right now. Jump in and start planning — or leave your
          email for mobile app updates.
        </p>

        <Link
          href="/trips/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-accent-dark"
        >
          <Sparkles className="h-5 w-5" />
          Open trip planner
        </Link>

        <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow-lg ring-1 ring-border">
          <p className="mb-4 text-sm font-medium text-muted">Get notified when the mobile app launches</p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&apos;re on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border py-3 pl-12 pr-4 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
              >
                {status === "loading" ? "Joining..." : "Notify me"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-error">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </section>
  );
}
