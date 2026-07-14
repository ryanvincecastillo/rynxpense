import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandLogo variant="onDark" />

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#start"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Start
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/discover"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 sm:block"
          >
            Open app
          </Link>
          <Link
            href="/trips/new"
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark sm:px-5"
          >
            <Sparkles className="h-4 w-4" />
            Plan my trip
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
              Destination and budget in — named plan and peso reality check out. Free to
              use, no account required.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/trips/new" className="transition hover:text-primary">
                  Plan my trip
                </Link>
              </li>
              <li>
                <Link href="/discover" className="transition hover:text-primary">
                  Open app
                </Link>
              </li>
              <li>
                <a href="#discover" className="transition hover:text-primary">
                  Popular destinations
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
                  Mobile updates
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
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Rynxpense. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            Made for travelers in the Philippines and beyond
          </div>
        </div>
      </div>
    </footer>
  );
}
