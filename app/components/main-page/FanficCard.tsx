"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Fanfic, Section, Tags } from "@/db/types";
import React, { useTransition } from "react";
import TagsCarousel from "@/components/base/Tags";
import { FanficHeader } from "@/components/main-page/FanficHeader";
import { FanficCardContextMenu } from "@/components/main-page/FanficCardContextMenu";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  BookUp,
  BookUp2,
  CircleCheck,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/base/Tooltip";

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
            <div className="relative">
              <Card
                className={cn(
                  "my-1 bg-accent shadow-md rounded-lg -space-y-4 hover:shadow-lg border-l-4",
                  isDragging ? "" : "transition-all duration-300 ease-in-out"
                )}
              >
                <CardContent>
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="truncate flex-grow min-w-0">
                      <FanficHeader fanfic={fanfic} showComplete truncate />
                    </div>
                    <div className="flex flex-row gap-2 flex-shrink-0 items-center">
                      {fanfic.lastSent &&
                        fanfic.updatedAt > fanfic.lastSent && (
                          <Tooltip description="New update to upload">
                            <BookUp size="18" />
                          </Tooltip>
                        )}
                      {!fanfic.lastSent && (
                        <Tooltip description="Upload whole fic">
                          <BookUp2 size="18" />
                        </Tooltip>
                      )}
                      {fanfic.completedAt && <CircleCheck size="16" />}
                    </div>
                  </div>
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
          <div className="flex flex-col flex-wrap gap-4 mt-5">
            <Separator />
            <TagsCarousel tags={tags} />
          </div>
        </DrawerDialog>
      }
    ></FanficCardContextMenu>
  );
}
