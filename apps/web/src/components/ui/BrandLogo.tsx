import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  showWordmark = true,
  size = 36,
}: {
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <Link href="/home" className="flex items-center gap-2.5">
      <Image
        src="/logo.svg"
        alt="Rynxpense"
        width={showWordmark ? 120 : size}
        height={showWordmark ? 40 : size}
        priority
      />
      {!showWordmark && (
        <span className="sr-only">Rynxpense</span>
      )}
    </Link>
  );
}
