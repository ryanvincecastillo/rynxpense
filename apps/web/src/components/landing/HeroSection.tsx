"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    src: "/hero-tropical.png",
    alt: "DIY traveler at a tropical lagoon",
    position: "object-[center_35%]",
  },
  {
    src: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=2000&h=1200&fit=crop&q=80",
    alt: "Friends exploring a sunny coastal town",
    position: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&h=1200&fit=crop&q=80",
    alt: "Travelers overlooking a bright mountain lake",
    position: "object-[center_40%]",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&h=1200&fit=crop&q=80",
    alt: "Bright alpine lake and travel landscape",
    position: "object-center",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=2000&h=1200&fit=crop&q=80",
    alt: "Friends traveling together in a sunny city",
    position: "object-[center_30%]",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&h=1200&fit=crop&q=80",
    alt: "Road trip adventure under bright sky",
    position: "object-[center_45%]",
  },
];

const INTERVAL_MS = 3500;

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden">
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
            className={`object-cover scale-105 transition-transform duration-[4000ms] ease-out ${slide.position} ${
              i === index ? "scale-100" : "scale-105"
            }`}
            sizes="100vw"
          />
        </div>
      ))}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#062018]/88 via-[#062018]/55 to-[#062018]/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#062018]/80 via-transparent to-[#062018]/35"
      />

      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 lg:justify-center lg:pb-28">
        <div className="max-w-2xl animate-fade-up">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[#A7F3D0] sm:text-sm">
            Rynxpense · DIY travel
          </p>
          <h1 className="mt-4 font-display text-[2.85rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
            Plan the trip yourself.
            <span className="mt-3 block text-[#7DD3FC]">
              Know the pesos before you book.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/88 sm:text-xl">
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
            <a
              href="#why"
              className="text-base font-semibold text-white/85 underline-offset-4 transition hover:text-white hover:underline"
            >
              Why DIY here
            </a>
          </div>

          <div className="mt-8 flex gap-1.5" aria-hidden>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
