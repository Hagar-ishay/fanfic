"use client";

import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";
import { Breadcrumbs } from "@/components/base/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useTopbar } from "./TopbarContext";

export function GlobalTopbar() {
  const { isMobile } = useSidebar();
  const { segments, actions } = useTopbar();

  return (
    <div
      className={cn(
        "flex justify-between items-center sticky top-0 bg-gradient-to-r from-background/95 to-muted/95 backdrop-blur-md z-40 border-b border-border/50 shadow-md",
        isMobile ? "px-3 py-2" : "px-4 py-1.5"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <HomeIcon />
        {segments.length > 0 && <Breadcrumbs segments={segments} />}
      </div>
      <div className="flex flex-row items-center gap-2">{actions}</div>
    </div>
  );
}