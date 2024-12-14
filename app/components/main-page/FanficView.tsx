"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fanfic, Section, Tags } from "@/db/types";
import React, { useTransition } from "react";
import TagsCarousel from "@/components/base/Tags";
import { FanficHeader } from "@/components/main-page/FanficHeader";
import { FanficCardContextMenu } from "@/components/main-page/FanficCardContextMenu";
import { Separator } from "@/components/ui/separator";
import InputLabels from "@/components/main-page/InputLabels";
import FanficCard from "@/components/main-page/FanficCard";
import { Button } from "@/components/ui/button";
import { PlusIcon, Tag } from "lucide-react";
import EditableLabels from "@/components/main-page/InputLabels";

export default function FanficView({
  fanfic,
  isDragging,
  transferableSections,
}: {
  fanfic: Fanfic;
  isDragging: boolean;
  transferableSections: Section[];
}) {
  const [isPending, startTransition] = useTransition();

  const tags: Tags = {
    WORD_COUNT: [fanfic.wordCount?.toString() ?? ""],
    CHAPTER_COUNT: [fanfic.chapterCount ?? ""],
    STATUS: [fanfic.completedAt ? "Complete" : "In Progress"],
    ...fanfic.tags,
  };

  const Description = () => {
    return fanfic.summary?.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <FanficCardContextMenu
      isPending={isPending}
      startTransition={startTransition}
      sections={transferableSections}
      fanfic={fanfic}
      trigger={
        <DrawerDialog
          title={
            <div className="flex flex-col items-center gap-3">
              <FanficHeader fanfic={fanfic} />
            </div>
          }
          description={
            <ScrollArea className="overflow-auto max-h-40 max-w-md mx-auto px-6 mt-5 py-4 border border-muted rounded-lg shadow-md">
              <Description />
            </ScrollArea>
          }
          trigger={
            // don't remove div, required to open dialog
            <div> 
              <FanficCard
                fanfic={fanfic}
                isDragging={isDragging}
                isPending={isPending}
              />
            </div>
          }
        >
          <div className="flex flex-col flex-wrap gap-4">
            <EditableLabels fanficId={fanfic.id} labels={fanfic.editableLabels} />              
            <Separator />
            <TagsCarousel tags={tags} />
          </div>
        </DrawerDialog>
      }
    ></FanficCardContextMenu>
  );
}
