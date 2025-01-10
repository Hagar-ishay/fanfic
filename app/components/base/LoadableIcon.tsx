"use client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadableIcon({
  defaultIcon,
  isPending,
  successState,
}: {
  defaultIcon: React.ReactNode;
  isPending: boolean;
  successState?: boolean;
}) {
  if (isPending) {
    return <Loader2 className={cn("w-fit", "animate-spin")} />;
  }
  if (successState === false) {
    return <XCircle />;
  }
  if (successState) {
    return <CheckCircle />;
  }
  return defaultIcon;
}
