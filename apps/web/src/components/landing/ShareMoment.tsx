import { Share2 } from "lucide-react";

export function ShareMoment() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Share to socials
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Built a plan? Post it where your friends already are.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              No new feed to join. Copy a link and share to Facebook, X, Messenger, or your
              barkada group chat — complete with peso budget and day-by-day picks.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                One public link for your DIY plan
              </li>
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                Looks good when previewed in FB &amp; chats
              </li>
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                Friends can open it and plan their own
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-[#062018] p-6 text-white shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A7F3D0]">
              Link preview
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-white text-text">
              <div className="h-36 bg-gradient-to-br from-primary to-[#026bb8]" />
              <div className="p-4">
                <p className="text-xs font-semibold text-primary">rynxpense.com</p>
                <p className="mt-1 font-display text-lg font-bold">
                  Tokyo · ₱65,000 DIY plan
                </p>
                <p className="mt-1 text-sm text-muted">
                  5 days · named stays, food &amp; activities · peso reality check included
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">
              After you generate a trip, tap Share — copy, Facebook, or X.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
