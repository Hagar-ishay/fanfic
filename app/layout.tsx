import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { FontProvider } from "@/components/base/FontProvider";
import { ThemeProvider } from "@/components/base/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { AuthProvider } from "./providers";
import { SidebarWrapper } from "@/(top-bar)/(components)/SidebarWrapper";

import "./globals.css";

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
              {
                <>
                  {/* <SidebarWrapper /> */}
                  <div className="flex flex-col h-screen w-screen">
                    <main>{children}</main>
                    <Toaster />
                  </div>
                </>
              }
            </SidebarProvider>
          </ThemeProvider>
        </FontProvider>
      </html>
    </AuthProvider>
  );
}
