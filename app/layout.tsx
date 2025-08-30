import { FontProvider } from "@/components/base/FontProvider";
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
    <AuthProvider>
      <html suppressHydrationWarning>
        <FontProvider>
          <body className="h-screen overflow-hidden">
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
                    <SidebarInset className="">
                      <TopbarWrapper />
                      <main>{children}</main>
                      <Toaster />
                    </SidebarInset>
                  </>
                </TopbarProvider>
              </SidebarProvider>
            </ThemeProvider>
          </body>
        </FontProvider>
      </html>
    </AuthProvider>
  );
}
