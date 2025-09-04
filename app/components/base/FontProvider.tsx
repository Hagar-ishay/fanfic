import React from "react";
import { cn } from "@/lib/utils";
import localFont from "next/font/local";
import { LXGW_WenKai_Mono_TC } from "next/font/google";

const wenKai = LXGW_WenKai_Mono_TC({
  variable: "--font-wenkai",
  style: "normal",
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const blokletters = localFont({
  src: "../../fonts/Blokletters-Balpen.ttf",
  variable: "--font-blokletters",
  fallback: ["wenkai"],
  display: "swap",
});

const bloklettersLight = localFont({
  src: "../../fonts/Blokletters-Potlood.ttf",
  variable: "--font-blokletters-light",
  display: "swap",
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Static font classes that can be used server-side
export const fontClasses = cn(
  blokletters.variable,
  bloklettersLight.variable,
  wenKai.variable,
  blokletters.className
);
