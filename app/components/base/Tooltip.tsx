"use client";
import type React from "react";
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

export function Tooltip({
  description,
  children,
  className,
}: {
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  return (
    <TooltipProvider>
      <BaseTooltip open={isMobile ? false : undefined}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={className}>{description}</TooltipContent>
      </BaseTooltip>
    </TooltipProvider>
  );
}
