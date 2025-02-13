"use client";

import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React from "react";

export function HomeIcon({ renderMobile = false }: { renderMobile?: boolean }) {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const width = isMobile ? 50 : 70;

  if (renderMobile && !isMobile) {
    return;
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Image
        onClick={toggleSidebar}
        src="/icon.png"
        alt="Penio Fanfic"
        width={width}
        height={width}
        className={cn(
          "dark:mix-blend-exclusion dark:bg-secondary-foreground dark:rounded-full mb-1 hover:cursor-pointer"
        )}
      />
      <div
        className={cn(
          "flex flex-col items-center justify-center cursor-default font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600",
          isMobile ? "text-lg" : "text-2xl"
        )}
      >
        <p>Penio</p>
        <p>Fanfic</p>
      </div>
    </div>
  );
}
