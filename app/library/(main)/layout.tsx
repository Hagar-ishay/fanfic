import TopBar from "@/(top-bar)/(components)/TopBar";
import { Header } from "@/components/base/Header";
import { listUserFanfics } from "@/db/fanfics";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { Options } from "@/library/(components)/Options";
import { Search } from "@/library/(components)/Search";
import { ShowHideLayout } from "@/library/sections/[sectionId]/(components)/ShowHideLayout";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <Header segments={[{ label: "Library", href: "/library" }]}>
        <ShowHideLayout>
          <Options sectionId={null} userId={user.id} />
        </ShowHideLayout>
      </Header>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
