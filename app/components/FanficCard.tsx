"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Fanfic, Section, Tags } from "@/db/types";
import React, { useTransition } from "react";
import TagsCarousel from "@/components/Tags";
import { FanficHeader } from "@/components/FanficHeader";
import { FanficCardContextMenu } from "@/components/FanficCardContextMenu";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function FanficCard({
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
            <div className="flex flex-col items-center">
              <FanficHeader fanfic={fanfic} />
            </div>
          }
          description={
            <ScrollArea className="overflow-auto max-h-40">
              <Description />
            </ScrollArea>
          }
          trigger={
            <div className="relative">
              <Card
                className={cn(
                  "p-2 my-2 bg-accent shadow-md rounded -space-y-4",
                  isDragging ? "" : "transition-all duration-300 ease-in-out"
                )}
              >
                <CardContent>
                  <FanficHeader fanfic={fanfic} showComplete truncate />
                  {isPending && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          }
        >
          <TagsCarousel tags={tags} />
        </DrawerDialog>
      }
    ></FanficCardContextMenu>
  );
}
