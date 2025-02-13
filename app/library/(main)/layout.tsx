import { Header } from "@/library/(components)/Header";
import { Options } from "@/library/sections/[sectionId]/(components)/Options";
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header segments={[{ label: "Library", href: "/library" }]}>
        <ShowHideLayout>
          <Options sectionId={null} userId={user.id} />
        </ShowHideLayout>
      </Header>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
