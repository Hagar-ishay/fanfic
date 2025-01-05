import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/base/theme";
import TopBar from "./(top-bar)/(components)/TopBar";
import { SignIn } from "@/components/SignIn";
import { cn } from "@/lib/utils";

const bloklettersLight = localFont({
  src: "./fonts/Blokletters-Potlood.ttf",
  variable: "--font-blokletters-light",
  weight: "100 900",
});

const blokletters = localFont({
  src: "./fonts/Blokletters-Balpen.ttf",
  variable: "--font-blokletters",
  weight: "100 900",
});

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
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            blokletters.className,
            blokletters.variable,
            bloklettersLight.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex flex-row items-center justify-between sticky top-0 z-50 p-4 shadow-md bg-muted gap-2">
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
              </SignedIn>
            </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
