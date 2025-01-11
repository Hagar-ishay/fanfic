"use client";

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
  return (
    <body
      className={cn(
        blokletters.variable,
        bloklettersLight.variable,
        wenKai.variable,
        blokletters.className,
        isMobile ? "text-sm" : "text-base"
      )}
    >
      {children}
    </body>
  );
}
