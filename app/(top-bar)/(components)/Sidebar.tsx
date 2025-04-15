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
import { HelpCircleIcon, Home, Library, LogOut, SearchIcon, Settings } from "lucide-react";
import { Search } from "@/library/(components)/Search";
import { MdOutlineExplore } from "react-icons/md";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { UserFanfic } from "@/db/types";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { Help } from "@/(top-bar)/(components)/Help";

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
    title: "Search",
    component: Search,
    icon: SearchIcon,
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

export function AppSidebar({ userFanfics }: { userFanfics: UserFanfic[] }) {
  const { data: session } = useSession();
  const { isMobile } = useSidebar();

  return (
    <Sidebar side="left" className="h-screen" collapsible="icon">
      <SidebarContent>
        <SidebarHeader>{isMobile && <HomeIcon />}</SidebarHeader>

        <SidebarMenu>
          {ITEMS.map((item) =>
            item.component ? (
              <SidebarMenuItem key={item.title} className="flex items-center ml-2">
                <item.component
                  userFanfics={userFanfics}
                  trigger={
                    <SidebarMenuButton>
                      {item.icon && <item.icon className="w-6 h-6 mr-2" />}
                      {item.title}
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
            ) : (
              <Link key={item.url} href={item.url || ""}>
                <SidebarMenuItem className="flex items-center ml-2">
                  <SidebarMenuButton>
                    {item.icon && <item.icon className="w-6 h-6 mr-2" />}
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <LibraryHelp
              trigger={
                <SidebarMenuButton>
                  <HelpCircleIcon />
                  <p>Help</p>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton
              onClick={() => signOut({ redirectTo: "/signin" })}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <LogOut className="w-6 h-6 mr-2" />
              <p>Signed in as {session?.user?.name}</p>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
