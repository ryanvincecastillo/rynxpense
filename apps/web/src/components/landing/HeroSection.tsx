import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchWidget } from "./SearchWidget";
import { HeroCarousel } from "./HeroCarousel";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                TikTok · IG · Reddit → Plan
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Free · No account
              </span>
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-[3.25rem]">
              Turn saved travel inspo into a trip you can{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                actually afford.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Paste links from TikTok, Instagram, Facebook, or Reddit — get named stays, food, and
              activities with peso estimates. No sign-up required.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-accent-dark"
              >
                Paste your saves
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3.5 font-semibold text-text shadow-md ring-1 ring-border transition hover:ring-primary/30"
              >
                How it works
              </a>
            </div>

            <div className="mt-10">
              <SearchWidget />
            </div>
          </div>

          <div className="animate-fade-up lg:pl-4" style={{ animationDelay: "150ms" }}>
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
