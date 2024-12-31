import { Header } from "@/library/(components)/Header";
import { getSection } from "@/db/sections";
import { notFound } from "next/navigation";
import { ShowHideModal } from "@/library/sections/[sectionId]/(components)/ShowHideModal";
import { AddFanficButton } from "@/library/sections/[sectionId]/(components)/AddFanficButton";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { connection } from "next/server";

type Props = { params: Promise<{ sectionId: string }> };

export default async function Layout({
  params,
  children,
  fanfics,
}: {
  params: Props["params"];
  children: React.ReactNode;
  fanfics: React.ReactNode;
}) {
  await connection();

  const requestParams = await params;
  const sectionId = parseInt(requestParams.sectionId);
  const currentSection = await getSection(sectionId);
  if (!currentSection) {
    return notFound();
  }

  return (
    <>
      <Header title={`Library - ${currentSection.displayName}`}>
        <AddFanficButton sectionId={sectionId} />
        <AddNewSectionButton sectionId={sectionId} />
      </Header>
      {children}
      <ShowHideModal>{fanfics}</ShowHideModal>
    </>
  );
}
