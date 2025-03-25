import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { SignIn } from "@/components/SignIn";
import { FontProvider } from "@/components/base/FontProvider";
import { ThemeProvider } from "@/components/base/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fanfic Penio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
    <ClerkProvider>
      <html suppressHydrationWarning>
        <FontProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider defaultOpen={false} >
                <SignedIn>
                  <AppSidebar />
                  <div className="flex flex-col h-screen w-screen">
                  <Suspense>
                    <main>{children}</main>
                    <Toaster />
                  </Suspense>
                </div>
              </SignedIn>
              <SignedOut>
                <main>
                  <SignIn />
                </main>
              </SignedOut>
            </SidebarProvider>
          </ThemeProvider>
        </FontProvider>
      </html>
    </ClerkProvider>
    </Suspense>
  );
}
