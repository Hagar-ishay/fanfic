"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn, getIsDesktop } from "@/lib/utils";
import { Fragment } from "react";

export function Header({
  segments,
  children,
}: {
  segments: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  const isDesktop = getIsDesktop();
  return (
    <div className="flex justify-between items-center sticky top-16 bg-background/80 backdrop-blur-sm z-40 shadow-md py-6">
      <div className="pl-8">
        <Breadcrumb>
          <BreadcrumbList
            className={cn(
              "flex flex-row font-bold items-center",
              isDesktop ? "text-2xl" : "text-lg"
            )}
          >
            {segments.map((segment, index) => (
              <Fragment key={segment.href}>
                <BreadcrumbItem className="font-semibold" key={segment.href}>
                  <BreadcrumbLink href={segment.href}>
                    {segment.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.length > index + 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-4">
        <div className="gap-4 flex flex-row">{children}</div>
      </div>
    </div>
  );
}
