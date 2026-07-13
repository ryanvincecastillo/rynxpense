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
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Rynxpense"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      {showWordmark && (
        <span className="text-xl font-bold text-text">Rynxpense</span>
      )}
    </Link>
  );
}
