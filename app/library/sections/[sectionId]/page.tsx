import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getBreadcrumbs, getSection, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import { getActiveIntegrations, hasUserAo3Credentials } from "@/db/integrations";
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

  // Run all initial queries in parallel for better performance
  const [userSections, fanfics, currentSection, userIntegrations, hasAo3Credentials] = await Promise.all([
    listUserSections(user.id),
    selectSectionFanfic([sectionId]),
    getSection(sectionId),
    getActiveIntegrations(user.id),
    hasUserAo3Credentials(user.id),
  ]);

  if (!currentSection) {
    return notFound();
  }

  // These can be computed synchronously since we have the data
  const childSections = userSections.filter(
    (section) => section.parentId === sectionId
  );

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  // Get breadcrumbs in parallel with fanfic integrations
  const [segments] = await Promise.all([
    getBreadcrumbs(sectionId, currentSection.name, currentSection.parentId),
  ]);

  // Fetch fanfic integrations in parallel (much faster than sequential)
  const fanficIntegrationsMap: Record<number, any[]> = {};
  const integrationPromises = fanfics.map(async (fanfic) => {
    const integrations = await getFanficIntegrations(fanfic.id);
    return { fanficId: fanfic.id, integrations };
  });

  const integrationResults = await Promise.all(integrationPromises);
  for (const { fanficId, integrations } of integrationResults) {
    fanficIntegrationsMap[fanficId] = integrations;
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
      <SetTopbar segments={segments}>
        <AddFanfic sectionId={sectionId} userId={user.id} />
      </SetTopbar>
      <div className="bg-gradient-to-br from-background via-muted/20 to-background w-full min-h-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12 max-w-full sm:max-w-7xl sm:mx-auto">
          <div className="space-y-4 w-full max-w-full">
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
                hasAo3Credentials={hasAo3Credentials}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
