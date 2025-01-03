import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Header } from "@/library/(components)/Header";
import { SectionTransitionProvider } from "@/library/(components)/SectionTransitionContext";
import { connection } from "next/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return (
    <div className="flex flex-col min-h-screen">
      <SectionTransitionProvider>
        <Header segments={[{ label: "Library", href: "/library" }]}>
          <AddNewSectionButton sectionId={null} />
        </Header>
        <div className="flex-grow">{children}</div>
      </SectionTransitionProvider>
    </div>
  );
}
