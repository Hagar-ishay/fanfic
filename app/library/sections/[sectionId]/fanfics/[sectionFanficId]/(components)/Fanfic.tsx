"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/base/DrawerDialog";
import TagsCarousel from "@/components/base/Tags";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Section, Tags, UserFanfic } from "@/db/types";
import { cn, getIsDesktop } from "@/lib/utils";
import { FanficHeader } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficHeader";
import EditableLabels from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/InputLabels";
import { SummaryContent } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/Summary";
import { Ellipsis, EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { FanficContextMenu } from "./FanficContextMenu";

export default function Fanfic({
  fanfic,
  transferableSections,
}: {
  fanfic: UserFanfic;
  transferableSections: Section[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = getIsDesktop();

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
        className={cn(
          "flex flex-col gap-6 p-6",
          !isDesktop ? "h-full" : "",
          "max-w-2xl mx-auto"
        )}
        optionsMenu={
          <FanficContextMenu
            fanfic={fanfic}
            sections={transferableSections}
            trigger={
              <Button size="icon" variant="ghost" className="">
                {isDesktop ? <Ellipsis /> : <EllipsisVertical />}
              </Button>
            }
          />
        }
      >
        <DrawerDialogHeader className="space-y-2 px-0">
          <DrawerDialogTitle className="text-2xl font-bold text-center">
            <FanficHeader fanfic={fanfic} />
          </DrawerDialogTitle>
        </DrawerDialogHeader>

        <div className="flex-1">
          <ScrollArea className="overflow-auto max-h-80 mx-auto py-4 px-6 border border-muted rounded-lg shadow-sm bg-muted/5">
            <SummaryContent summary={fanfic.summary ?? ""} />
          </ScrollArea>
        </div>

        <div className="space-y-6">
          <EditableLabels
            fanficId={fanfic.sectionId}
            labels={fanfic.editableLabels}
          />

          <DrawerDialogFooter className={cn("px-0", !isDesktop ? "mb-10" : "")}>
            <div className="w-full space-y-4">
              <Separator className="my-2" />
              <TagsCarousel tags={tags} />
            </div>
          </DrawerDialogFooter>
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
