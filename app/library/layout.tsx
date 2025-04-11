import { listUserFanfics } from "@/db/fanfics";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { Search } from "@/library/(components)/Search";
import TopBar from "@/(top-bar)/(components)/TopBar";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) {
    return notFound();
  }

  const userFanfics = await listUserFanfics(user!.id);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar>
        <div className="flex flex-row items-center gap-2">
          <Search userFanfics={userFanfics} />
          <LibraryHelp />
        </div>
      </TopBar>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
