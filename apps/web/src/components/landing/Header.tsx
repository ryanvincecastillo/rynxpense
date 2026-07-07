import Link from "next/link";
import { MapPin } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
            R
          </div>
          <span className="text-xl font-bold text-text">Rynxpense</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#discover" className="text-sm font-medium text-muted hover:text-primary">
            Discover
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted hover:text-primary">
            How it works
          </a>
          <a href="#features" className="text-sm font-medium text-muted hover:text-primary">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 sm:block"
          >
            My Trips
          </Link>
          <Link
            href="/app/trips/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-accent-dark"
          >
            Plan a trip
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
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                R
              </div>
              <span className="text-xl font-bold">Rynxpense</span>
            </div>
            <p className="max-w-sm text-sm text-muted">
              AI-powered trip budget planner. Plan your itinerary, estimate costs, and track
              spending — all in one place.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/app" className="hover:text-primary">
                  Web App
                </Link>
              </li>
              <li>
                <Link href="/app/trips/new" className="hover:text-primary">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <a href="#discover" className="hover:text-primary">
                  Popular Destinations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href="#waitlist" className="hover:text-primary">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a href="mailto:hello@rynxpense.com" className="hover:text-primary">
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
