"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** All AI-generated. People/places weighted to the right; left kept open for copy. */
const slides = [
  {
    src: "/hero-elnido.png",
    alt: "Travelers at El Nido lagoons, Philippines",
    place: "El Nido",
    region: "Philippines",
    position: "object-[70%_center]",
  },
  {
    src: "/hero-boracay.png",
    alt: "Friends on Boracay White Beach, Philippines",
    place: "Boracay",
    region: "Philippines",
    position: "object-[65%_center]",
  },
  {
    src: "/hero-siargao.png",
    alt: "Surfers in Siargao, Philippines",
    place: "Siargao",
    region: "Philippines",
    position: "object-[68%_center]",
  },
  {
    src: "/hero-bali.png",
    alt: "Travelers at Bali rice terraces",
    place: "Bali",
    region: "Indonesia",
    position: "object-[72%_center]",
  },
];
/** Tokyo/Seoul/Singapore AI gens had baked-in city titles — kept out of carousel until clean. */

const INTERVAL_MS = 4000;

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden bg-white">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className={`object-cover transition-transform duration-[4500ms] ease-out ${slide.position} ${
              i === index ? "scale-100" : "scale-[1.04]"
            }`}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Soft left scrim only — keeps photos bright, no tropical green filter */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 lg:justify-center lg:pb-28">
        <div className="max-w-xl animate-fade-up lg:max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-sm">
            Rynxpense · DIY travel
          </p>
          <h1 className="mt-4 font-display text-[2.85rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem] drop-shadow-sm">
            Plan the trip yourself.
            <span className="mt-3 block text-white">
              Know the pesos before you book.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
            Built for Filipino travelers who DIY — named stays, food, and activities with a
            budget reality check. Free, no account needed.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
            >
              Plan my trip
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/discover"
              className="text-base font-semibold text-white/90 underline-offset-4 transition hover:text-white hover:underline"
            >
              Discover destinations
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Show ${slide.place}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-white/85">
              <span className="font-display font-bold text-white">{active.place}</span>
              <span className="mx-1.5 text-white/50">·</span>
              <span>{active.region}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
