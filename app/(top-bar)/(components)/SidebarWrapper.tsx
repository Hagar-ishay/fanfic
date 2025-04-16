import { auth } from "@/auth";

import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";
import { listUserFanfics } from "@/db/fanfics";
import { notFound } from "next/navigation";
import { connection } from "next/dist/server/request/connection";

export async function SidebarWrapper() {
  await connection();
  const { user } = (await auth())!;
  if (!user) {
    return notFound();
  }

  const userFanfics = await listUserFanfics(user.id);
  return <AppSidebar userFanfics={userFanfics} />;
}
