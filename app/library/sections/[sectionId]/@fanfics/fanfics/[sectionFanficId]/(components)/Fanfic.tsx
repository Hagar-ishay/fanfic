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
} from "@/components/base/DrawerDialog";
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

        <DrawerDialogDescription className="flex-1">
          <ScrollArea className="overflow-auto mx-auto py-4 px-6 border border-muted rounded-lg shadow-sm bg-muted/5">
            <div className="space-y-2 text-pretty">
              {fanfic.summary
                ?.split("\n")
                .map((line: string, index: number) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {line}
                  </p>
                ))}
            </div>
          </ScrollArea>
        </DrawerDialogDescription>

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
