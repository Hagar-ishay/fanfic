import { notFound } from "next/navigation";
import React from "react";
import { getFanficById } from "@/db/fanfics";
import { getBreadcrumbs, listUserSections } from "@/db/sections";
import Fanfic from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Fanfic";
import { auth } from "@/auth";
import { SetTopbar } from "@/components/base/SetTopbar";
import { EllipsisVertical } from "lucide-react";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import {
  getActiveIntegrations,
  hasUserAo3Credentials,
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

  // Run all queries in parallel for maximum performance
  const [
    userSections,
    segments,
    activeIntegrations,
    fanficIntegrations,
    hasAo3Credentials,
  ] = await Promise.all([
    listUserSections(user.id),
    getBreadcrumbs(sectionId, fanfic.sectionName, fanfic.sectionParentId),
    getActiveIntegrations(user.id),
    getFanficIntegrations(fanfic.id),
    hasUserAo3Credentials(user.id),
  ]);

  const transferableSections = userSections.filter(
    (section) => section.id !== sectionId
  );

  return (
    <>
      <SetTopbar segments={segments}>
        <Kudos fanfic={fanfic} hasAo3Credentials={hasAo3Credentials} />
        <FanficContextMenu
          fanfic={fanfic}
          sections={transferableSections}
          userIntegrations={activeIntegrations}
          fanficIntegrations={fanficIntegrations}
          trigger={
            <div className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <EllipsisVertical size={16} />
            </div>
          }
        />
      </SetTopbar>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 pt-8 pb-6">
          <Fanfic fanfic={fanfic} />
        </div>
      </div>
    </>
  );
}
