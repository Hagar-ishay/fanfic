import { Header } from "@/library/(components)/Header";
import { Options } from "@/library/sections/[sectionId]/(components)/Options";
import { ShowHideLayout } from "@/library/sections/[sectionId]/(components)/ShowHideLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header segments={[{ label: "Library", href: "/library" }]}>
        <ShowHideLayout>
          <Options sectionId={null} />
        </ShowHideLayout>
      </Header>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
