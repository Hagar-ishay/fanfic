"use client";

import { BlockQuote } from "@/components/base/BlockQuote";
import { Button } from "@/components/ui/button";
import { Section, UserFanfic } from "@/db/types";
import { cn, getFont } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import { SummaryContent } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Summary";
import { Ellipsis, EllipsisVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FanficStats } from "./FanficStats";
import { Tags } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Tags";
import InputLabels from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/InputLabels";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Fanfic({
  fanfic,
  transferableSections,
}: {
  fanfic: UserFanfic;
  transferableSections: Section[];
}) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6 mx-auto relative w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative flex justify-between items-start bg-gradient-to-r from-card via-accent/10 to-card p-4 sm:p-6 rounded-lg border shadow-md">
        <div className="flex flex-col gap-3 min-w-0 flex-1 pl-2">
          <div className="flex items-start gap-3 ">
            <span
              className={cn("text-2xl sm:text-3xl", getFont(fanfic.language))}
            >
              {fanfic.title}
            </span>
            <Link
              href={fanfic.sourceUrl}
              target="_blank"
              className="hover:scale-110 transition-transform"
            >
              <ExternalLink className="h-6 w-6" />
            </Link>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className={"truncate font-blokletters-light"}>
              by {fanfic.author}
            </span>
            {fanfic.authorUrl && (
              <Link href={fanfic.authorUrl} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <div className="w-12 h-12 flex-shrink-0">
          <div
            className={cn("absolute top-2", isMobile ? "right-2" : "right-5")}
          >
            <FanficContextMenu
              fanfic={fanfic}
              sections={transferableSections}
              trigger={
                <Button size="icon" variant="ghost">
                  {isMobile ? <EllipsisVertical /> : <Ellipsis />}
                </Button>
              }
            />
          </div>
        </div>
      </div>
      {fanfic.summary && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-card via-accent/5 to-card border p-6 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
          <div
            className={cn(
              "relative max-h-40 overflow-y-auto",
              getFont(fanfic.language)
            )}
          >
            <BlockQuote>
              <SummaryContent summary={fanfic.summary} />
            </BlockQuote>
          </div>
        </div>
      )}

      <div className="relative flex flex-col gap-3 bg-gradient-to-br from-card to-accent/10 p-6 rounded-lg border shadow-md">
        <h3 className="font-semibold text-lg border-b pb-2 text-foreground/90 cursor-default">
          Personal Labels
        </h3>
        <InputLabels
          sectionId={fanfic.sectionId}
          fanficId={fanfic.id}
          labels={fanfic.editableLabels}
        />
      </div>

      <div className="cursor-default space-y-8 relative">
        <FanficStats fanfic={fanfic} />
        <Tags tags={fanfic.tags} />
      </div>
    </div>
  );
}
