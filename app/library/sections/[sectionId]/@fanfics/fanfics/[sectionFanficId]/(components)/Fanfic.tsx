"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Section, Tags, UserFanfic } from "@/db/types";
import React from "react";
import TagsCarousel from "@/components/base/Tags";
import { FanficHeader } from "@/library/sections/[sectionId]/@fanfics/fanfics/[sectionFanficId]/(components)/FanficHeader";
import { Separator } from "@/components/ui/separator";
import EditableLabels from "@/library/sections/[sectionId]/@fanfics/fanfics/[sectionFanficId]/(components)/InputLabels";
import { useRouter } from "next/navigation";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/base/DrawerDialogV2";
import { Button } from "@/components/ui/button";
import { Ellipsis, EllipsisVertical } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FanficContextMenu } from "./FanficContextMenu";
import { cn } from "@/lib/utils";

export default function Fanfic({
  fanfic,
  transferableSections,
}: {
  fanfic: UserFanfic;
  transferableSections: Section[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setIsOpen(true);
  }, [router]);

  const tags: Tags = {
    WORD_COUNT: [fanfic.wordCount?.toString() ?? ""],
    CHAPTER_COUNT: [fanfic.chapterCount ?? ""],
    STATUS: [fanfic.completedAt ? "Complete" : "In Progress"],
    ...fanfic.tags,
  };

  return (
    <DrawerDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DrawerDialogContent
        className={cn("flex flex-col gap-4", !isDesktop ? "h-full" : "")}
        optionsMenu={
          <FanficContextMenu
            fanfic={fanfic}
            sections={transferableSections}
            trigger={
              <Button size="icon" variant="ghost">
                {isDesktop ? <Ellipsis /> : <EllipsisVertical />}
              </Button>
            }
          />
        }
      >
        <DrawerDialogHeader>
          <DrawerDialogTitle className="flex flex-row items-center justify-center gap-3 w-full">
            <FanficHeader fanfic={fanfic} />
          </DrawerDialogTitle>
        </DrawerDialogHeader>
        <DrawerDialogDescription>
          <ScrollArea className="overflow-auto mx-auto px-6 mt-5 py-4 border border-muted rounded-lg shadow-md">
            {fanfic.summary?.split("\n").map((line: string, index: number) => (
              <div key={index}>
                {line}
                <br />
              </div>
            ))}
          </ScrollArea>
        </DrawerDialogDescription>
        <EditableLabels
          fanficId={fanfic.sectionId}
          labels={fanfic.editableLabels}
        />
        <DrawerDialogFooter
          className={cn("px-6 pb-4", !isDesktop ? "mb-10" : "")}
        >
          <div className="flex flex-col flex-wrap gap-4 w-full align-center ">
            <Separator />
            <TagsCarousel tags={tags} />
          </div>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
