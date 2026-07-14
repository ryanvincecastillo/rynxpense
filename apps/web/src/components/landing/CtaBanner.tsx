import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#041824] px-8 py-12 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(2,131,223,0.45), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,87,34,0.35), transparent 40%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-2xl font-bold sm:text-4xl">
              Saw a trip online? Check if you can afford it.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              Set your destination and budget. Get a named plan in pesos — with a reality
              check before you book anything.
            </p>
            <div className="mt-8">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white transition hover:bg-accent-dark"
              >
                Plan my trip
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
