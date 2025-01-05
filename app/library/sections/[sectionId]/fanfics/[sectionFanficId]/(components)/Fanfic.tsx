"use client";

import { BlockQuote } from "@/components/base/BlockQuote";
import { Button } from "@/components/ui/button";
import { Section, UserFanfic } from "@/db/types";
import { getIsDesktop } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import { SummaryContent } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Summary";
import { Ellipsis, EllipsisVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FanficStats } from "./FanficStats";
import { Tags } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Tags";
import InputLabels from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/InputLabels";

export default function Fanfic({
  fanfic,
  transferableSections,
}: {
  fanfic: UserFanfic;
  transferableSections: Section[];
}) {
  const isDesktop = getIsDesktop();

  return (
    <div className="flex flex-col gap-8 p-6 mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start bg-gradient-to-r from-background to-accent/5 p-4 rounded-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {fanfic.title}
            </h1>
            <Link href={fanfic.sourceUrl} target="_blank">
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>by {fanfic.author}</span>
            {fanfic.authorUrl && (
              <Link href={fanfic.authorUrl} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <FanficContextMenu
          fanfic={fanfic}
          sections={transferableSections}
          trigger={
            <Button size="icon" variant="ghost" className="">
              {isDesktop ? <Ellipsis /> : <EllipsisVertical />}
            </Button>
          }
        />
      </div>
      {fanfic.summary && (
        <div className="relative max-h-40 overflow-y-auto rounded-lg bg-accent/5 p-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none opacity-20" />
          <BlockQuote>
            <SummaryContent summary={fanfic.summary} />
          </BlockQuote>
        </div>
      )}

      <div className="flex flex-col gap-2 bg-accent/5 p-4 rounded-lg">
        <h3 className="font-semibold text-lg border-b pb-2">Personal Labels</h3>
        <InputLabels
          sectionId={fanfic.sectionId}
          fanficId={fanfic.id}
          labels={fanfic.editableLabels}
        />
      </div>

      <div className="space-y-8">
        <FanficStats fanfic={fanfic} />
        <Tags tags={fanfic.tags} />
      </div>
    </div>
  );
}
