import { FontProvider, fontClasses } from "@/components/base/FontProvider";
import { ThemeProvider } from "@/components/base/theme";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { AuthProvider } from "./providers";
import SidebarWrapper from "@/(top-bar)/(components)/SidebarWrapper";
import { TopbarProvider } from "@/components/base/TopbarContext";
import { TopbarWrapper } from "@/components/base/TopbarWrapper";

import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Fanfic Penio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <FontProvider>
        <body className={`h-screen overflow-hidden ${fontClasses}`}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider defaultOpen={true}>
                <TopbarProvider>
                  <>
                    <Suspense
                      fallback={<div className="w-64 h-screen bg-sidebar" />}
                    >
                      <SidebarWrapper />
                    </Suspense>
                    <SidebarInset className="flex flex-col h-screen">
                      <TopbarWrapper />
                      <main className="flex-1 overflow-y-auto">{children}</main>
                      <Toaster />
                    </SidebarInset>
                  </>
                </TopbarProvider>
              </SidebarProvider>
            </ThemeProvider>
          </AuthProvider>
        </body>
      </FontProvider>
    </html>
  );
}
