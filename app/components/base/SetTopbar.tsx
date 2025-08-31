"use client";

import { useEffect, ReactNode } from "react";
import { useTopbar } from "./TopbarContext";

type BreadcrumbSegment = {
  label: string;
  href: string;
};

type SetTopbarProps = {
  segments: BreadcrumbSegment[];
  children?: ReactNode;
};

export function SetTopbar({ segments, children }: SetTopbarProps) {
  const { setTopbarContent } = useTopbar();

  useEffect(() => {
    setTopbarContent(segments, children);
    
    // Cleanup when component unmounts
    return () => {
      setTopbarContent([]);
    };
  }, [segments, children, setTopbarContent]);

  // This component doesn't render anything - it just sets topbar content
  return null;
}