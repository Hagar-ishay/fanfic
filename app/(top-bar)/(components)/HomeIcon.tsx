"use client";

import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

export function HomeIcon() {
  const { toggleSidebar, isMobile } = useSidebar();
  const width = isMobile ? 50 : 70;

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
    </div>
  );
}
