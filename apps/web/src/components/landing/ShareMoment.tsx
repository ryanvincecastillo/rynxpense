import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Facebook, Link2, MessageCircle } from "lucide-react";

const channels = [
  { label: "Copy link", icon: Copy },
  { label: "Facebook", icon: Facebook },
  { label: "X", text: "𝕏" },
  { label: "Chats", icon: MessageCircle },
] as const;

export function ShareMoment() {
  return (
    <section className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Share to socials
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-text sm:text-4xl sm:leading-[1.1]">
              Your DIY plan, posted where your barkada already hangs out.
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              No new feed. No app to download. One public link with the peso budget and
              day-by-day picks — ready for Facebook, X, Messenger, or the group chat.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {channels.map((ch) => (
                <span
                  key={ch.label}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-2 text-sm font-medium text-text ring-1 ring-border"
                >
                  {"icon" in ch && ch.icon ? (
                    <ch.icon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="text-xs font-black leading-none">{"text" in ch ? ch.text : ""}</span>
                  )}
                  {ch.label}
                </span>
              ))}
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "One public link for the whole DIY plan",
                "Rich preview in FB, Messenger & chats",
                "Friends open it and plan their own trip",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/trips/new"
              className="mt-8 inline-flex text-sm font-semibold text-primary transition hover:underline"
            >
              Generate a trip, then tap Share →
            </Link>
          </div>

          {/* Chat-style share preview */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-accent/10 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0B1F2A] p-5 shadow-2xl ring-1 ring-white/10 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2]">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Barkada trip chat</p>
                    <p className="text-[11px] text-white/50">Messenger · just now</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  Preview
                </span>
              </div>

              <div className="space-y-3">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#1877F2] px-3.5 py-2.5 text-sm text-white">
                  Guys check this Tokyo DIY plan 👀
                </div>

                <div className="mr-auto max-w-[92%] overflow-hidden rounded-2xl rounded-bl-md bg-white shadow-lg">
                  <div className="relative h-40">
                    <Image
                      src="/hero-tokyo.png"
                      alt="Tokyo trip share preview"
                      fill
                      className="object-cover object-center"
                      sizes="400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      DIY plan
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      <Link2 className="h-3 w-3" />
                      rynxpense.com
                    </p>
                    <p className="mt-1 font-display text-base font-bold leading-snug text-text">
                      Tokyo · ₱65,000 DIY plan
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      5 days · named stays, food &amp; activities · peso reality check
                    </p>
                  </div>
                </div>

                <div className="mr-auto max-w-[70%] rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2.5 text-sm text-white/90">
                  Budget looks doable. Sending my dates 🔥
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80">
                  <Copy className="h-3 w-3" /> Copy
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1877F2]/30 px-2.5 py-1.5 text-xs font-medium text-white">
                  <Facebook className="h-3 w-3" /> Facebook
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80">
                  <span className="text-[10px] font-black">𝕏</span> Post
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
