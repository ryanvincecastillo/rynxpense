"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { popularDestinations } from "@rynxpense/ui-tokens";
import { formatCurrency } from "@rynxpense/shared";

const doubled = [...popularDestinations, ...popularDestinations];

export function DestinationMarquee() {
  return (
    <section id="discover" className="overflow-hidden py-16">
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              Discover
            </span>
            <h2 className="text-2xl font-bold text-text sm:text-3xl">
              Where will you go next?
            </h2>
            <p className="mt-2 max-w-lg text-muted">
              Tap a destination to jump straight into the AI trip builder — no sign-up required.
            </p>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark"
          >
            Plan any destination →
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />

        <div className="animate-marquee flex w-max gap-5 px-4 hover:[animation-play-state:paused]">
          {doubled.map((dest, i) => (
            <Link
              key={`${dest.id}-${i}`}
              href={`/trips/new?destination=${encodeURIComponent(dest.name)}&budget=${dest.budgetFrom}`}
              className="group relative w-[280px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="280px"
                />
                {dest.badge && (
                  <span className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-white shadow">
                    {dest.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-sm text-muted">
                  from{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(dest.budgetFrom)}
                  </span>
                  <span className="text-muted"> / {dest.days} days</span>
                </p>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {dest.rating}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
