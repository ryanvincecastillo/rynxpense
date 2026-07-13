"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { popularDestinations } from "@rynxpense/ui-tokens";

const slides = [
  {
    id: "banner",
    type: "banner" as const,
    image: "/banner-hero.png",
    alt: "Rynxpense travel budget app preview",
  },
  ...popularDestinations.slice(0, 4).map((dest) => ({
    id: dest.id,
    type: "destination" as const,
    image: dest.image,
    alt: `${dest.name}, ${dest.country}`,
    name: dest.name,
    country: dest.country,
  })),
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = slides[index];

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              i === index ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[1.02]"
            }`}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              className={`object-cover ${
                s.type === "banner" ? "object-[center_30%]" : "object-center"
              }`}
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div
              className={`absolute inset-0 ${
                s.type === "banner"
                  ? "bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                  : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              }`}
            />
            {s.type === "destination" && (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Trending destination
                </p>
                <h3 className="text-2xl font-bold">{s.name}</h3>
                <p className="text-sm text-white/80">{s.country}</p>
              </div>
            )}
            {s.type === "banner" && (
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                  Your trip, your budget
                </p>
                <p className="mt-1 max-w-xs text-sm text-white/90">
                  Plan itineraries, track every peso, and share with friends — all in one app.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-text shadow-md backdrop-blur transition hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-text shadow-md backdrop-blur transition hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
