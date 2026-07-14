import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="pb-6 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#062018] px-8 py-14 text-center text-white sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(2,131,223,0.4), transparent 42%), radial-gradient(circle at 80% 70%, rgba(255,87,34,0.28), transparent 38%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to DIY your next trip?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/80">
              Set destination and budget. Get a named plan in pesos — then share it with
              anyone.
            </p>
            <Link
              href="/trips/new"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white transition hover:bg-accent-dark"
            >
              Plan my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
