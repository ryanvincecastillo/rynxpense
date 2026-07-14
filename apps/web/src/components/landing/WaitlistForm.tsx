"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

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
    <section id="waitlist" className="border-t border-border bg-white py-12">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <p className="text-sm font-medium text-muted">
          Want the mobile app? Leave your email — the web planner is live now.
        </p>

        {status === "success" ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You&apos;re on the list!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
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
    </section>
  );
}
