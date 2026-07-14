"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

const doubled = [...popularDestinations, ...popularDestinations];

export function DestinationsTease() {
  return (
    <section className="overflow-hidden border-y border-border/80 bg-white py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Destinations
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Popular DIY trips
            </h2>
            <p className="mt-2 max-w-lg text-muted">
              Tap a peso template — or browse all destinations with filters.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
          >
            Browse all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20" />

        <div
          className="animate-marquee flex w-max gap-5 px-4 hover:[animation-play-state:paused]"
          style={{ animationDuration: "70s" }}
        >
          {doubled.map((dest, i) => (
            <Link
              key={`${dest.id}-${i}`}
              href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
              className="group relative w-[260px] shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-display text-lg font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 line-clamp-1 text-xs text-muted">{dest.samplePlan}</p>
                <p className="text-sm text-muted">
                  from{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(dest.budgetFrom)}
                  </span>
                  <span> / {dest.days} days</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
