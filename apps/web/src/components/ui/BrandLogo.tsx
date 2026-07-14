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
  // Transparent mark (white R) on dark; blue plate icon on light
  const src = variant === "onDark" ? "/logo-transparent.png" : "/icon.png";

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0"
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
