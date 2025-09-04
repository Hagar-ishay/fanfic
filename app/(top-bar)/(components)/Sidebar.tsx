"use client";

import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HelpCircleIcon, Home, Library, LogOut, Settings, Search } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { useEffect, useState } from "react";

const PLATFORM_ITEMS = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Search,
  },
  {
    title: "Library",
    url: "/library",
    icon: Library,
  },
];

const SETTINGS_ITEMS = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle SSR and loading states
  if (!isMounted || status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <Sidebar side="left" variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-14 sm:size-12 items-center justify-center rounded-lg">
              <span className="text-sm font-semibold">
                <HomeIcon />
              </span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-normal">
              <span className="truncate font-semibold">Fanfic Penio</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PLATFORM_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SETTINGS_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <LibraryHelp
              trigger={
                <SidebarMenuButton>
                  <HelpCircleIcon />
                  <span>Help</span>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => void signOut({ redirectTo: "/signin" })}
              className="w-full"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs font-semibold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-normal">
                <span className="truncate font-semibold">
                  {session?.user?.name || "User"}
                </span>
                <span className="truncate text-xs leading-normal">{session?.user?.email}</span>
              </div>
              <LogOut className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
