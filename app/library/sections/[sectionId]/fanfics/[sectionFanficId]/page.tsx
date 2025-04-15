import { notFound } from "next/navigation";
import React from "react";
import { getFanficById } from "@/db/fanfics";
import { getBreadcrumbs, listUserSections } from "@/db/sections";
import Fanfic from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Fanfic";
import { auth } from "@/auth";
import { Header } from "@/components/base/Header";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
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

export default async function Page({ params }: { params: Promise<{ sectionId: string; sectionFanficId: string }> }) {
  const requestParams = await params;
  const { user } = (await auth())!;
  const sectionId = parseInt(requestParams.sectionId);
  const fanficId = parseInt(requestParams.sectionFanficId);
  const fanfic = await getFanficById(fanficId);
  if (!user || !fanfic || fanfic.sectionId !== sectionId) {
    notFound();
  }

  const userSections = await listUserSections(user.id);
  const transferableSections = userSections.filter((section) => section.id !== sectionId);
  const segments = await getBreadcrumbs(sectionId, fanfic.sectionName, fanfic.sectionParentId);

  return (
    <>
      <Header segments={segments}>
        <Kudos fanfic={fanfic} />
        <FanficContextMenu
          fanfic={fanfic}
          sections={transferableSections}
          trigger={
            <Button size="icon" variant="ghost">
              {<EllipsisVertical />}
            </Button>
          }
        />
      </Header>
      <div className="w-full">
        <Fanfic fanfic={fanfic} />
      </div>
    </>
  );
}
