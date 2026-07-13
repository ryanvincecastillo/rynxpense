"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Map, PlusCircle, User } from "lucide-react";

const tabs = [
  { href: "/discover", label: "Home", icon: Home },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/trips/new", label: "Plan", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/discover" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rynxpense" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-text">Rynxpense</span>
          </Link>
          <Link
            href="/trips/new"
            className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white sm:block"
          >
            + Plan trip
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white md:hidden">
        <div className="mx-auto flex max-w-lg justify-around py-2">
          {tabs.map((tab) => {
            const active =
              tab.href === "/discover"
                ? pathname === "/discover"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <tab.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
