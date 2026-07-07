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
    <section id="waitlist" className="bg-primary py-16">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Get early access</h2>
        <p className="mt-2 text-white/80">
          Join the waitlist and be first to plan smarter trips with AI
        </p>

        {status === "success" ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-white">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">You&apos;re on the list! We&apos;ll be in touch.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl py-3 pl-12 pr-4 text-text outline-none ring-2 ring-transparent focus:ring-white/50"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl bg-accent px-8 py-3 font-semibold text-white shadow-lg hover:bg-accent-dark disabled:opacity-70"
            >
              {status === "loading" ? "Joining..." : "Join waitlist"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-red-200">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
