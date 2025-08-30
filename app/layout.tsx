import { FontProvider } from "@/components/base/FontProvider";
import { ThemeProvider } from "@/components/base/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { AuthProvider } from "./providers";
import { SidebarWrapper } from "@/(top-bar)/(components)/SidebarWrapper";
import { TopbarProvider } from "@/components/base/TopbarContext";
import { TopbarWrapper } from "@/components/base/TopbarWrapper";

import "./globals.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Fanfic Penio",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html suppressHydrationWarning>
        <FontProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider defaultOpen={false}>
              <TopbarProvider>
                <>
                  <Suspense>
                    <SidebarWrapper />
                  </Suspense>
                  <div className="flex flex-col h-screen w-screen">
                    <TopbarWrapper />
                    <main>{children}</main>
                    <Toaster />
                  </div>
                </>
              </TopbarProvider>
            </SidebarProvider>
          </ThemeProvider>
        </FontProvider>
      </html>
    </AuthProvider>
  );
}
