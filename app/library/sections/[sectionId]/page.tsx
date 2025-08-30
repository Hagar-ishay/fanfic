import Link from "next/link";
import { Section } from "@/library/(components)/Section";
import { notFound } from "next/navigation";
import { getBreadcrumbs, getSection, listUserSections } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import FanficList from "@/library/sections/[sectionId]/(components)/FanficList";
import { getIntegrationsByCategory } from "@/db/integrations";
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

  const childSections = userSections.filter((section) => section.parentId === sectionId);

  const transferableSections = userSections.filter((section) => {
    return section.id !== sectionId && section.parentId !== sectionId;
  });

  const segments = await getBreadcrumbs(sectionId, currentSection.name, currentSection.parentId);
  
  // Fetch integrations for context menus
  const [cloudIntegrations, deliveryIntegrations] = await Promise.all([
    getIntegrationsByCategory(user.id, "cloud_storage"),
    getIntegrationsByCategory(user.id, "delivery"),
  ]);
  const userIntegrations = [...cloudIntegrations, ...deliveryIntegrations];
  
  // Fetch fanfic integrations for each fanfic
  const fanficIntegrationsMap: Record<number, any[]> = {};
  for (const fanfic of fanfics) {
    fanficIntegrationsMap[fanfic.id] = await getFanficIntegrations(fanfic.id);
  }
  
  // Serialize the data for client components (convert Date objects to strings)
  const serializedUserIntegrations = userIntegrations.map(integration => ({
    ...integration,
    creationTime: integration.creationTime.toISOString(),
    updateTime: integration.updateTime?.toISOString() || null,
  }));
  
  const serializedFanficIntegrationsMap: Record<number, any[]> = {};
  for (const [fanficId, integrations] of Object.entries(fanficIntegrationsMap)) {
    serializedFanficIntegrationsMap[Number(fanficId)] = integrations.map(fi => ({
      ...fi,
      creationTime: fi.creationTime.toISOString(),
      updateTime: fi.updateTime?.toISOString() || null,
      lastTriggered: fi.lastTriggered?.toISOString() || null,
    }));
  }
  
  // Serialize the fanfics as well
  const serializedFanfics = fanfics.map(fanfic => ({
    ...fanfic,
    createdAt: fanfic.createdAt.toISOString(),
    updatedAt: fanfic.updatedAt.toISOString(),
    completedAt: fanfic.completedAt?.toISOString() || null,
    creationTime: fanfic.creationTime.toISOString(),
    updateTime: fanfic.updateTime?.toISOString() || null,
  }));

  return (
    <>
      <SetTopbar segments={segments}>
        <AddFanfic sectionId={sectionId} userId={user.id} />
      </SetTopbar>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="space-y-4">
            {childSections.map((child) => (
              <Link key={child.id} href={`/library/sections/${child.id}`}>
                <div className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <Section section={child} transferableSections={transferableSections} />
                </div>
              </Link>
            ))}
            {fanfics.length == 0 ? (
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
                <LibraryHelp showAsPage />
              </div>
            ) : (
              <FanficList 
                fanfics={serializedFanfics} 
                sectionId={sectionId} 
                transferableSections={transferableSections} 
                userId={user.id}
                userIntegrations={serializedUserIntegrations}
                fanficIntegrationsMap={serializedFanficIntegrationsMap}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
