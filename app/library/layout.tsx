import { listUserFanfics } from "@/db/fanfics";
import LibraryTopBar from "@/library/(components)/LibraryBreadcrumbs";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getBreadcrumbs, getSection } from "@/db/sections";
import { headers } from "next/headers";
import { Search } from "@/library/(components)/Search";
import TopBar from "@/(top-bar)/(components)/TopBar";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { Header } from "@/components/base/Header";
import { ShowHideLayout } from "@/library/sections/[sectionId]/(components)/ShowHideLayout";
import { Options } from "@/library/(components)/Options";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) {
    return notFound();
  }

  const userFanfics = await listUserFanfics(user!.id);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar>
        <div className="mx-2 flex-1 min-w-0">
          <Search userFanfics={userFanfics} />
        </div>
        <LibraryHelp />
      </TopBar>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
