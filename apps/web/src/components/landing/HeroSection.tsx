import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Clean travel photo — do not use banner-hero.png here (it has baked-in marketing copy). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=2000&h=1200&fit=crop&q=80";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden sm:min-h-[92vh]">
      <Image
        src={HERO_IMAGE}
        alt="Island lagoon in the Philippines — plan trips you can afford"
        fill
        priority
        className="object-cover object-[center_40%] animate-[hero-zoom_20s_ease-in-out_infinite_alternate]"
        sizes="100vw"
      />

      {/* Solid left wash so HTML copy never fights photo detail */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#041824] via-[#041824]/88 to-[#041824]/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#041824]/90 via-transparent to-[#041824]/45"
      />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:min-h-[92vh] sm:px-6 sm:pb-20 lg:justify-center lg:pb-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
            Rynxpense
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Destination + budget in.
            <span className="mt-2 block text-[#7DD3FC]">
              Named plan + peso reality check out.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Klook sells tickets. Rynxpense tells you if the trip fits your budget —
            with named stays, food, and activities in pesos — before you book.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
            >
              Plan my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              How it works
            </a>
          </div>

          <p className="mt-6 text-sm text-white/60">
            Free · No account required · Built for Filipino travelers
          </p>
        </div>
      </div>
    </section>
  );
}
