import { auth } from "@/auth";

import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { listUserFanfics } from "@/db/fanfics";
import { connection } from "next/dist/server/request/connection";

export async function SidebarWrapper() {
  await connection();
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <AppSidebar />;
}
