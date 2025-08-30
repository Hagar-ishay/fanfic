"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import localFont from "next/font/local";
import { LXGW_WenKai_Mono_TC } from "next/font/google";

const wenKai = LXGW_WenKai_Mono_TC({
  variable: "--font-wenkai",
  style: "normal",
  weight: "700",
  subsets: [
    "cyrillic",
    "cyrillic-ext",
    "greek",
    "greek-ext",
    "lisu",
    "vietnamese",
  ],
});

const blokletters = localFont({
  src: "../../fonts/Blokletters-Balpen.ttf",
  variable: "--font-blokletters",
  fallback: ["wenkai"],
});

const bloklettersLight = localFont({
  src: "../../fonts/Blokletters-Potlood.ttf",
  variable: "--font-blokletters-light",
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  // Apply classes to body on client side to avoid hydration mismatch
  React.useEffect(() => {
    const body = document.body;
    const classes = cn(
      blokletters.variable,
      bloklettersLight.variable,
      wenKai.variable,
      blokletters.className,
      isMobile ? "text-sm" : "text-base"
    );
    
    // Add font classes
    classes.split(' ').forEach(cls => {
      if (cls.trim()) {
        body.classList.add(cls.trim());
      }
    });

    return () => {
      // Cleanup on unmount
      classes.split(' ').forEach(cls => {
        if (cls.trim()) {
          body.classList.remove(cls.trim());
        }
      });
    };
  }, [isMobile]);

  return <>{children}</>;
}

// Static font classes that can be used server-side
export const fontClasses = cn(
  blokletters.variable,
  bloklettersLight.variable,
  wenKai.variable,
  blokletters.className
);
