"use client";
import { Breadcrumbs } from "@/components/base/Breadcrumbs";

export function Header({
  segments,
  children,
}: {
  segments: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center sticky top-16 bg-background/80 backdrop-blur-sm z-40 shadow-md py-6">
      <div className="pl-8">
        <Breadcrumbs segments={segments} />
      </div>
      <div className="pr-4">
        <div className="gap-4 flex flex-row">{children}</div>
      </div>
    </div>
  );
}
