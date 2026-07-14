import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#041824]">
      <div className="mx-auto grid min-h-[88vh] max-w-7xl lg:min-h-[92vh] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy sits on solid brand dark — never over banner text */}
        <div className="relative z-10 flex flex-col justify-center px-4 pb-10 pt-28 sm:px-6 sm:pb-16 lg:pb-24 lg:pr-10 lg:pt-24">
          <div className="max-w-xl animate-fade-up">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-white/65 sm:text-sm">
              Rynxpense
            </p>
            <h1 className="mt-4 font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4rem]">
              Destination + budget in.
              <span className="mt-3 block text-[#7DD3FC]">
                Named plan + peso reality check out.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 sm:text-xl sm:leading-relaxed">
              Klook sells tickets. Rynxpense tells you if the trip fits your budget —
              with named stays, food, and activities in pesos — before you book.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
              >
                Plan my trip
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="text-base font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                How it works
              </a>
            </div>

            <p className="mt-7 text-sm text-white/55 sm:text-base">
              Free · No account required · Built for Filipino travelers
            </p>
          </div>
        </div>

        {/* AI person banner — cropped so baked marketing copy is gone */}
        <div className="relative min-h-[48vh] lg:min-h-full">
          <Image
            src="/banner-hero-person.png"
            alt="Traveler planning a trip with Rynxpense"
            fill
            priority
            className="object-cover object-[30%_center] lg:object-[20%_center]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#041824] to-transparent lg:w-24"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#041824]/50 to-transparent lg:hidden"
          />
        </div>
      </div>
    </section>
  );
}
