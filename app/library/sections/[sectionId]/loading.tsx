"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 size={100} className="animate-spin" />
    </div>
  );
}

