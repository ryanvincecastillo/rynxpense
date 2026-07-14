import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="pb-8 pt-2 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-[2rem] min-h-[320px] sm:min-h-[360px]">
          <Image
            src="/hero-elnido.png"
            alt=""
            fill
            className="object-cover object-[center_40%]"
            sizes="(max-width: 1280px) 100vw, 1280px"
            aria-hidden
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#041820]/92 via-[#041820]/75 to-[#041820]/45"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#041820]/80 via-transparent to-[#041820]/30"
          />

          <div className="relative z-10 flex min-h-[320px] flex-col items-start justify-center px-8 py-14 sm:min-h-[360px] sm:px-14 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Start planning
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.05]">
              Ready to DIY your next trip?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              Pick a destination and peso budget. Get a named plan — then share it with
              anyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark sm:text-base"
              >
                Plan my trip
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/15 sm:text-base"
              >
                <Compass className="h-4 w-4" />
                Browse destinations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
