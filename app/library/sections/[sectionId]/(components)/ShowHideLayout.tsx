"use client";
import { usePathname } from "next/navigation";
import * as React from "react";

export type ShowHideModalProps = {
  children: React.ReactNode;
};

export function ShowHideLayout({ children }: ShowHideModalProps) {
  const path = usePathname();
  return <>{!path.includes("/fanfics/") && children}</>;
}
