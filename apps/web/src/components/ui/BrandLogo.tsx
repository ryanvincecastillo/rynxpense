import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  showWordmark = true,
  size = 36,
  variant = "default",
  href = "/home",
}: {
  showWordmark?: boolean;
  size?: number;
  variant?: "default" | "onDark";
  href?: string;
}) {
  const wordClass = variant === "onDark" ? "text-white" : "text-text";
  // Dedicated brand assets (not /icon.png) so favicon metadata routes can't collide
  // and browsers/CDNs don't keep serving a stale optimized favicon as the logo.
  const src =
    variant === "onDark" ? "/brand-mark-on-dark.png" : "/brand-mark.png";

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        className="shrink-0 rounded-[9px]"
      />
      {showWordmark ? (
        <span
          className={`font-display text-[1.4rem] font-bold leading-none tracking-[-0.03em] ${wordClass}`}
        >
          Rynxpense
        </span>
      ) : (
        <span className="sr-only">Rynxpense</span>
      )}
    </Link>
  );
}
