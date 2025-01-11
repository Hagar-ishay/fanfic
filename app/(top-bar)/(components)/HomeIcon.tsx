"use client";

import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function HomeIcon() {
  const isMobile = useIsMobile();
  const width = isMobile ? 50 : 70;

  return (
    <Link href="/home" passHref className="min-w-6 min-h-10">
      <Image
        src="/icon.png"
        alt="Home"
        width={width}
        height={width}
        className={cn(
          "dark:mix-blend-exclusion dark:bg-white dark:rounded-full absolute ",
          isMobile ? "top-5 left-1" : "top-2 left-3"
        )}
      />
    </Link>
  );
}
