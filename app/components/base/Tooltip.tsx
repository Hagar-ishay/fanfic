"use client";
import { getIsDesktop } from "@/lib/utils";
import type React from "react";
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function Tooltip({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  const isDesktop = getIsDesktop();
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
