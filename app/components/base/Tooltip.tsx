"use client";
import type React from "react";
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

export function Tooltip({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <TooltipProvider>
      {/* disable on mobile */}
      <BaseTooltip open={!isDesktop ? false : undefined}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </BaseTooltip>
    </TooltipProvider>
  );
}
