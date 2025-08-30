"use client";

import { Breadcrumbs } from "@/components/base/Breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTopbar } from "./TopbarContext";
import { Separator } from "@/components/ui/separator";

export function GlobalTopbar() {
  const { segments, actions } = useTopbar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {segments.length > 0 && <Breadcrumbs segments={segments} />}
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">{actions}</div>
    </header>
  );
}