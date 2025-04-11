"use client";

import { HomeIcon } from "@/(top-bar)/(components)/HomeIcon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Home, Library, LogOut, Search, Settings } from "lucide-react";
import Link from "next/link";

const ITEMS = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Search",
    url: "/explore",
    icon: Search,
  },
  {
    title: "Library",
    url: "/library",
    icon: Library,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useUser();

  const { isMobile } = useSidebar();

  return (
    <Sidebar side="left" className="fixed top-0 h-full" collapsible="icon">
      <SidebarContent>
        <SidebarHeader>{isMobile && <HomeIcon />}</SidebarHeader>

        <SidebarMenu>
          {ITEMS.map((item) => (
            <Link key={item.url} href={item.url}>
              <SidebarMenuItem className="flex items-center ml-2">
                <SidebarMenuButton>
                  {item.icon && <item.icon className="w-6 h-6 mr-2" />}
                  {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <SignOutButton>
                <LogOut className="w-6 h-6 mr-2" />
              </SignOutButton>
              <p>Signed in as {user?.firstName || user?.username}</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
