import { auth } from "@/auth";

import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { listUserFanfics } from "@/db/fanfics";
import { notFound } from "next/navigation";

export async function SidebarWrapper() {
  const { user } = (await auth())!;
  if (!user) {
    return notFound();
  }

  const userFanfics = await listUserFanfics(user.id);
  return <AppSidebar userFanfics={userFanfics} />;
}
