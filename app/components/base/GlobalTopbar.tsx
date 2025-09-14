"use client";

import { Breadcrumbs } from "@/components/base/Breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTopbar } from "./TopbarContext";
import { Separator } from "@/components/ui/separator";

export function GlobalTopbar() {
  const { segments, actions } = useTopbar();

  return (
    <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
        {segments.length > 0 && <Breadcrumbs segments={segments} />}
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-4 shrink-0">
        {actions}
      </div>
    </header>
  );
}
