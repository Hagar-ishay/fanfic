"use client";
import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";
import { Breadcrumbs } from "@/components/base/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
export function Header({
  segments,
  children,
}: {
  segments: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  const { isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "flex justify-between items-center sticky top-0 bg-sidebar backdrop-blur-sm z-40 shadow-md",
        isMobile && "pt-3 pb-3"
      )}
    >
      <div className="pl-2 flex flex-row items-center gap-2">
        <HomeIcon />
        <Breadcrumbs segments={segments} />
      </div>
      <div className="pr-4">
        <div className="flex flex-row">{children}</div>
      </div>
    </div>
  );
}
