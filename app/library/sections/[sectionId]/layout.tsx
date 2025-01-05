import { getBreadcrumbs, getSection } from "@/db/sections";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { Header } from "@/library/(components)/Header";
import { AddFanficButton } from "@/library/sections/[sectionId]/(components)/AddFanficButton";
import { ShowHideLayout } from "@/library/sections/[sectionId]/(components)/ShowHideLayout";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ sectionId: string }> };

export default async function Layout({
  params,
  children,
}: {
  params: Props["params"];
  children: React.ReactNode;
}) {
  const requestParams = await params;
  const sectionId = parseInt(requestParams.sectionId);
  const currentSection = await getSection(sectionId);
  if (!currentSection) {
    return notFound();
  }

  return (
    <div>
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
        <ShowHideLayout>
          <AddFanficButton sectionId={sectionId} />
          <AddNewSectionButton sectionId={sectionId} />
        </ShowHideLayout>
      </Header>
      {children}
    </div>
  );
}
