import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getBreadcrumbs, getSection, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import { getActiveIntegrations } from "@/db/integrations";
import { getFanficIntegrations } from "@/db/fanficIntegrations";
import { LibraryHelp } from "@/library/(components)/LibraryHelp";
import { auth } from "@/auth";
import { SetTopbar } from "@/components/base/SetTopbar";
import { AddFanfic } from "@/library/sections/[sectionId]/(components)/AddFanfic";
export const maxDuration = 59;

type Props = {
  params: Promise<{ sectionId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const currentSection = await getSection(sectionId);

  if (!currentSection) {
    return notFound();
  }

  const displayName = currentSection.name;

  return {
    title: `Penio Fanfic - ${displayName}`,
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.sectionId);
  const { user } = (await auth())!;

  if (!user) {
    return notFound();
  }

  const [userSections, fanfics, currentSection] = await Promise.all([
    listUserSections(user.id),
    selectSectionFanfic([sectionId]),
    getSection(sectionId),
  ]);

  if (!currentSection) {
    return notFound();
  }

  const childSections = userSections.filter(
    (section) => section.parentId === sectionId
  );

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  const segments = await getBreadcrumbs(
    sectionId,
    currentSection.name,
    currentSection.parentId
  );

  const userIntegrations = await getActiveIntegrations(user.id);

  // Fetch fanfic integrations for each fanfic
  const fanficIntegrationsMap: Record<number, any[]> = {};
  for (const fanfic of fanfics) {
    fanficIntegrationsMap[fanfic.id] = await getFanficIntegrations(fanfic.id);
  }

  const serializedFanficIntegrationsMap: Record<number, any[]> = {};
  for (const [fanficId, integrations] of Object.entries(
    fanficIntegrationsMap
  )) {
    serializedFanficIntegrationsMap[Number(fanficId)] = integrations.map(
      (fi) => fi
    );
  }

  return (
    <>
      <SetTopbar segments={segments} />
      <div className="bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 pt-8 pb-12">
          <div className="mb-4 flex justify-end">
            <AddFanfic sectionId={sectionId} userId={user.id} />
          </div>
          <div className="space-y-4">
            {childSections.map((child) => (
              <Link key={child.id} href={`/library/sections/${child.id}`}>
                <div className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <Section
                    section={child}
                  />
                </div>
              </Link>
            ))}
            {fanfics.length == 0 ? (
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
                <LibraryHelp showAsPage />
              </div>
            ) : (
              <FanficList
                fanfics={fanfics}
                sectionId={sectionId}
                transferableSections={transferableSections}
                userIntegrations={userIntegrations}
                fanficIntegrationsMap={serializedFanficIntegrationsMap}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
