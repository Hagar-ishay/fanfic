import { Header } from "@/components/base/Header";
import { getBreadcrumbs, getSection } from "@/db/sections";
import { Options } from "@/library/(components)/Options";
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
          <Options sectionId={sectionId} />
        </ShowHideLayout>
      </Header>
      {children}
    </div>
  );
}
