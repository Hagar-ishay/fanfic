import { auth } from "@/auth";

import { AppSidebar } from "@/(top-bar)/(components)/Sidebar";

export default async function SidebarWrapper() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <AppSidebar />;
}
