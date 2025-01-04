"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/base/DrawerDialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn, getIsDesktop } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Loading() {
  const isDesktop = getIsDesktop()

  return (
    <DrawerDialog defaultOpen>
      <DrawerDialogContent
        className={cn(
          "flex flex-col gap-4 items-center justify-center",
          !isDesktop ? "h-full" : ""
        )}
      >
        <DrawerDialogHeader>
          <DrawerDialogTitle className="h-6" />
        </DrawerDialogHeader>
        <Loader2 className="h-16 w-16 animate-spin" />
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
