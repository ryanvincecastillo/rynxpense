"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cloud, LogIn } from "lucide-react";
import { listGuestTrips } from "@/lib/guest-trips";

export default function ProfilePage() {
  const [tripCount, setTripCount] = useState(0);

  useEffect(() => {
    setTripCount(listGuestTrips().length);
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl">
          👤
        </div>
        <h1 className="text-2xl font-bold">Guest mode</h1>
        <p className="mt-2 text-muted">
          Trips and TikTok/IG saves stay on this device. Sign in to sync across phones.
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-border">
        <p className="text-3xl font-bold text-primary">{tripCount}</p>
        <p className="text-sm text-muted">trips on this device</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/15">
        <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted">
          Your inspiration inbox and itineraries are stored locally — no account required to
          plan.
        </p>
      </div>

      <Link
        href="/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-md"
      >
        <LogIn className="h-5 w-5" />
        Sign in (optional)
      </Link>
    </div>
  );
}
