import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { FontProvider } from "@/components/base/FontProvider";
import { ThemeProvider } from "@/components/base/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { AuthProvider } from "./providers";

import "./globals.css";
import { auth } from "@/auth";
import { listUserFanfics } from "@/db/fanfics";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Fanfic Penio",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = (await auth())!;
  if (!user) {
    return notFound();
  }

  const userFanfics = await listUserFanfics(user.id);

  return (
    <AuthProvider>
      <html suppressHydrationWarning>
        <FontProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider defaultOpen={false}>
              {
                <>
                  <AppSidebar userFanfics={userFanfics} />
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
