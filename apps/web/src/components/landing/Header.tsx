import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#discover" className="text-sm font-medium text-muted transition hover:text-primary">
            Discover
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted transition hover:text-primary">
            How it works
          </a>
          <a href="#features" className="text-sm font-medium text-muted transition hover:text-primary">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/discover"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/5 sm:block"
          >
            Open app
          </Link>
          <Link
            href="/trips/new"
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-accent-dark sm:px-5"
          >
            <Sparkles className="h-4 w-4" />
            Plan free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandLogo />
            </div>
            <p className="max-w-sm text-sm text-muted">
              AI-powered trip budget planner. Plan your itinerary, estimate costs, and track
              spending — free to use, no account required.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/trips/new" className="transition hover:text-primary">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <Link href="/discover" className="transition hover:text-primary">
                  Web App
                </Link>
              </li>
              <li>
                <a href="#discover" className="transition hover:text-primary">
                  Popular Destinations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/login" className="transition hover:text-primary">
                  Sign in (optional)
                </Link>
              </li>
              <li>
                <a href="#waitlist" className="transition hover:text-primary">
                  Get updates
                </a>
              </li>
              <li>
                <a href="mailto:hello@rynxpense.com" className="transition hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted">© {new Date().getFullYear()} Rynxpense. All rights reserved.</p>
          <div className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            Made for travelers in the Philippines and beyond
          </div>
        </div>
      </div>
    </footer>
  );
}
