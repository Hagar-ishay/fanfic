import { getSection } from "@/db/sections";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Header } from "@/library/(components)/Header";
import { SectionTransitionProvider } from "@/library/(components)/SectionTransitionContext";
import { AddFanficButton } from "@/library/sections/[sectionId]/(components)/AddFanficButton";
import { ShowHideModal } from "@/library/sections/[sectionId]/(components)/ShowHideModal";
import { FanficTransitionProvider } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficTransitionContext";
import { notFound } from "next/navigation";
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

  async function getBreadcrumbs(
    sectionId: number,
    displayName: string,
    parentId: number | null
  ) {
    let breadcrumbs = [
      {
        label: displayName,
        href: `/library/sections/${sectionId}`,
      },
    ];
    if (parentId) {
      const parentSection = await getSection(parentId);
      if (parentSection) {
        const parentBreadcrumbs = await getBreadcrumbs(
          parentSection.id,
          parentSection.name,
          parentSection.parentId
        );
        breadcrumbs = [...parentBreadcrumbs, ...breadcrumbs];
      }
    }
    return breadcrumbs;
  }

  return (
    <SectionTransitionProvider>
      <FanficTransitionProvider>
        <Header
          segments={[
            { label: "Library", href: "/library" },
            ...(await getBreadcrumbs(
              sectionId,
              currentSection.name,
              currentSection.parentId
            )),
          ]}
        >
          <AddFanficButton sectionId={sectionId} />
          <AddNewSectionButton sectionId={sectionId} />
        </Header>
        {children}
        <ShowHideModal>{fanfics}</ShowHideModal>
      </FanficTransitionProvider>
    </SectionTransitionProvider>
  );
}
