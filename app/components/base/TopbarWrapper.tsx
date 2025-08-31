"use client";

import { useEffect, useState } from "react";
import { GlobalTopbar } from "./GlobalTopbar";

export function TopbarWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <GlobalTopbar />;
}