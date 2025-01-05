import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Header } from "@/library/(components)/Header";
import { connection } from "next/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header segments={[{ label: "Library", href: "/library" }]}>
        <AddNewSectionButton sectionId={null} />
      </Header>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
