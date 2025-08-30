import { notFound } from "next/navigation";
import React from "react";
import { getFanficById } from "@/db/fanfics";
import { getBreadcrumbs, listUserSections } from "@/db/sections";
import Fanfic from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Fanfic";
import { auth } from "@/auth";
import { SetTopbar } from "@/components/base/SetTopbar";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import {
  getActiveIntegrations,
  getIntegrationsByCategory,
} from "@/db/integrations";
import { getFanficIntegrations } from "@/db/fanficIntegrations";
import { Kudos } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Kudos";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionId: string; sectionFanficId: string }>;
}) {
  const requestParams = await params;
  const sectionId = parseInt(requestParams.sectionId);
  const fanficId = parseInt(requestParams.sectionFanficId);
  const fanfic = await getFanficById(fanficId);
  if (!fanfic || fanfic.sectionId !== sectionId) {
    notFound();
  }
  const displayName = fanfic.title;
  return {
    title: `Penio Fanfic - ${displayName}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string; sectionFanficId: string }>;
}) {
  const requestParams = await params;
  const { user } = (await auth())!;
  const sectionId = parseInt(requestParams.sectionId);
  const fanficId = parseInt(requestParams.sectionFanficId);
  const fanfic = await getFanficById(fanficId);
  if (!user || !fanfic || fanfic.sectionId !== sectionId) {
    notFound();
  }

  const userSections = await listUserSections(user.id);
  const transferableSections = userSections.filter(
    (section) => section.id !== sectionId
  );
  const segments = await getBreadcrumbs(
    sectionId,
    fanfic.sectionName,
    fanfic.sectionParentId
  );

  // Fetch integrations for the context menu
  const [activeIntegrations, fanficIntegrations] = await Promise.all([
    getActiveIntegrations(user.id),
    getFanficIntegrations(fanfic.id),
  ]);

  return (
    <>
      <SetTopbar segments={segments}>
        <Kudos fanfic={fanfic} />
        <FanficContextMenu
          fanfic={fanfic}
          sections={transferableSections}
          userIntegrations={activeIntegrations}
          fanficIntegrations={fanficIntegrations}
          trigger={
            <Button size="icon" variant="ghost">
              {<EllipsisVertical />}
            </Button>
          }
        />
      </SetTopbar>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg">
            <Fanfic fanfic={fanfic} />
          </div>
        </div>
      </div>
    </>
  );
}
