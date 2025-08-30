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
import { HelpCircleIcon, Home, Library, LogOut, Settings } from "lucide-react";
import { MdOutlineExplore } from "react-icons/md";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { UserFanfic } from "@/db/types";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { Help } from "@/(top-bar)/(components)/Help";
import { useEffect, useState } from "react";

const ITEMS = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: MdOutlineExplore,
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
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();
  const { isMobile } = useSidebar();

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
    <Sidebar
      side="left"
      className="h-screen bg-secondary text-secondary-foreground border-r border-secondary/20"
      collapsible="icon"
    >
      <SidebarContent className="bg-secondary">
        <SidebarHeader className="bg-secondary/95  border-secondary-foreground/10">
          {isMobile && <HomeIcon />}
        </SidebarHeader>

        <SidebarMenu className="px-2 py-4">
          {ITEMS.map((item) => (
            <Link key={item.url} href={item.url || ""}>
              <SidebarMenuItem className="mb-1">
                <SidebarMenuButton className="w-full hover:bg-secondary-foreground/10 text-secondary-foreground hover:text-secondary-foreground transition-all duration-200 rounded-lg">
                  {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                  {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="bg-secondary border-secondary-foreground/10">
        <SidebarMenu className="py-2">
          <SidebarMenuItem className="mb-1">
            <LibraryHelp
              trigger={
                <SidebarMenuButton className="w-full hover:bg-secondary-foreground/10 text-secondary-foreground hover:text-secondary-foreground transition-all duration-200 rounded-lg">
                  <HelpCircleIcon className="w-5 h-5 mr-3" />
                  <p>Help</p>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ redirectTo: "/signin" })}
              className="w-full hover:bg-secondary-foreground/10 text-secondary-foreground hover:text-secondary-foreground transition-all duration-200 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <p className="truncate">Signed in as {session?.user?.name}</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
