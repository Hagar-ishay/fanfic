"use client";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Breadcrumbs({
  segments,
}: {
  segments: { label: string; href: string }[];
}) {
  const firstSegmant = segments[0];
  const lastSegment = segments[segments.length - 1];
  const additionalSegments = segments.slice(1, segments.length - 1);

  const GetBreadcrumb = (segment: { label: string; href: string }) => {
    return (
      <BreadcrumbItem
        className="font-semibold text-accent-foreground/80"
        key={segment.href}
      >
        <BreadcrumbLink href={segment.href}>{segment.label}</BreadcrumbLink>
      </BreadcrumbItem>
    );
  };

  return (
    <Breadcrumb>
      <BreadcrumbList
        className={cn("flex flex-row font-bold items-center flex-shrink")}
      >
        {GetBreadcrumb(firstSegmant)}
        {additionalSegments.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {additionalSegments.map((segment, index) => (
                    <DropdownMenuItem key={index}>
                      <Link href={segment.href}>{segment.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}
        {firstSegmant !== lastSegment && (
          <>
            <BreadcrumbSeparator /> {GetBreadcrumb(lastSegment)}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
