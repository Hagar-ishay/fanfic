"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Kalam } from "next/font/google";
import localFont from "next/font/local";

const kalam = Kalam({
  weight: "300",
  style: "normal",
  variable: "--font-kalam",
});

const blokletters = localFont({
  src: "../../fonts/Blokletters-Balpen.ttf",
  variable: "--font-blokletters",
});

const bloklettersLight = localFont({
  src: "../../fonts/Blokletters-Potlood.ttf",
  variable: "--font-blokletters-light",
  weight: "100 300",
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <body
      className={cn(
        blokletters.variable,
        bloklettersLight.variable,
        kalam.variable,
        blokletters.className,
        isMobile ? "text-sm" : "text-base"
      )}
    >
      {children}
    </body>
  );
}
