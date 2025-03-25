import { Header } from "@/components/base/Header";
import { getBreadcrumbs, getSection } from "@/db/sections";
import { Options } from "@/library/(components)/Options";
import { ShowHideLayout } from "@/library/sections/[sectionId]/(components)/ShowHideLayout";

export default async function LibraryBreadcrumbs({ userId, sectionId }: { userId: string; sectionId?: number }) {
  let segments = [{ label: "Library", href: "/library" }];

  if (sectionId) {
    const currentSection = await getSection(sectionId);

    if (currentSection) {
      segments = [...segments, ...(await getBreadcrumbs(sectionId, currentSection.name, currentSection.parentId))];
    }
  }

  return (
    <Header segments={segments}>
      <ShowHideLayout>
        <Options sectionId={sectionId ?? null} userId={userId} />
      </ShowHideLayout>
    </Header>
  );
}
