import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/base/theme";
import TopBar from "./(top-bar)/(components)/TopBar";
import { SignIn } from "@/components/SignIn";
import { FontProvider } from "@/components/base/FontProvider";
import { Footer } from "@/(top-bar)/(components)/Footer";

export const metadata: Metadata = {
  title: "Fanfic Penio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html suppressHydrationWarning>
        <FontProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex flex-row items-center justify-between sticky top-0 z-50 p-4 shadow-md gap-2 bg-background">
              <Suspense>
                <SignedIn>
                  <TopBar />
                </SignedIn>
              </Suspense>
            </header>
            <Suspense>
              <SignedOut>
                <main>
                  <SignIn />
                </main>
              </SignedOut>
              <SignedIn>
                <main>{children}</main>
                <Toaster />
                <Footer />
              </SignedIn>
            </Suspense>
          </ThemeProvider>
        </FontProvider>
      </html>
    </ClerkProvider>
  );
}
