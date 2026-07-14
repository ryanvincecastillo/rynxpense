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
  const src = variant === "onDark" ? "/logo-white.svg" : "/logo.svg";

  return (
    <Link href="/home" className="flex items-center gap-2.5">
      <Image
        src={src}
        alt="Rynxpense"
        width={showWordmark ? 120 : size}
        height={showWordmark ? 40 : size}
        priority
      />
      {!showWordmark && <span className="sr-only">Rynxpense</span>}
    </Link>
  );
}
