import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  showWordmark = true,
  size = 36,
  variant = "default",
}: {
  showWordmark?: boolean;
  size?: number;
  variant?: "default" | "onDark";
}) {
  const wordClass = variant === "onDark" ? "text-white" : "text-text";

  return (
    <Link href="/home" className="flex items-center gap-2.5">
      <Image
        src="/icon.svg"
        alt=""
        width={size}
        height={size}
        priority
        className="rounded-[10px]"
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
