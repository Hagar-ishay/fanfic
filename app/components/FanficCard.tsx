"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Fanfic, Section, Tags } from "@/db/types";
import React from "react";
import TagsCarousel from "@/components/Tags";
import { FanficHeader } from "@/components/FanficHeader";
import { FanficCardContextMenu } from "@/components/FanficCardContextMenu";

export default function FanficCard({
  fanfic,
  transferableSections,
}: {
  fanfic: Fanfic;
  sectionId: number;
  transferableSections: Section[];
}) {
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
            <Card className={"bg-accent shadow-md rounded"}>
              <CardContent>
                <CardTitle className="mt-3 truncate">
                  <FanficHeader fanfic={fanfic} showComplete truncate />
                </CardTitle>
              </CardContent>
            </Card>
          }
        >
          <TagsCarousel tags={tags} />
        </DrawerDialog>
      }
    ></FanficCardContextMenu>
  );
}
