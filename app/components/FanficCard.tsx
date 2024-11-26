"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { DropdownMenu } from "@/components/base/Dropdown";
import SendToKindle from "@/components/SendToKindle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Fanfic, Section, Tags } from "@/db/types";
import { cn } from "@/lib/utils";
import { updateFic } from "@/server/updater";
import { CircleCheck, CircleChevronRight, ExpandIcon } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";

const MAX_TAGS_ITEM_LENGTH = 50;

export default function FanficCard({
  fanfic,
  isDragging,
  transferableSections,
}: {
  fanfic: Fanfic;
  sectionId: number;
  isDragging: boolean;
  transferableSections: Section[];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const tags: Tags = {
    WORD_COUNT: [fanfic.wordCount?.toString() || ""],
    CHAPTER_COUNT: [fanfic.chapterCount || ""],
    ...fanfic.tags,
  };

  const TagList = () => {
    type BadgeItem = {
      category: string;
      value: string;
    };

    type BadgeGroup = {
      badges: BadgeItem[];
      totalLength: number;
    };

    const badges: BadgeItem[] = Object.entries(tags).flatMap(
      ([category, values]) =>
        (values as string[]).map((value) => ({ category, value }))
    );

    const badgeGroups: BadgeGroup[] = badges.reduce(
      (groups: BadgeGroup[], badge: BadgeItem) => {
        const badgeLength = badge.value.length;

        let currentGroup = groups[groups.length - 1];

        if (
          !currentGroup ||
          currentGroup.totalLength + badgeLength > MAX_TAGS_ITEM_LENGTH ||
          currentGroup.badges.length > 2
        ) {
          groups.push({ badges: [badge], totalLength: badgeLength });
        } else {
          currentGroup.badges.push(badge);
          currentGroup.totalLength += badgeLength;
        }

        return groups;
      },
      []
    );

    return (
      <>
        {badgeGroups.map((group, index) => (
          <CarouselItem className="flex justify-center" key={index}>
            <div className="flex flex-row flex-wrap gap-3">
              {group.badges.map(({ category, value }) => (
                <Badge
                  className="w-fit"
                  key={value}
                  title={category.toLowerCase().replace("_", " s")}
                >
                  {value}
                </Badge>
              ))}
            </div>
          </CarouselItem>
        ))}
      </>
    );
  };

  const Description = () => {
    return fanfic.summary?.split("\n").map((line) => (
      <span key={line}>
        {line}
        <br />
      </span>
    ));
  };

  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<"button">
  >((props, ref) => (
    <Button ref={ref} {...props}>
      <CircleChevronRight />
    </Button>
  ));

  const Title = ({ showComplete }: { showComplete: boolean }) => {
    return (
      <>
        <div className="text-xl text-accent-foreground flex-row">
          <a
            href={fanfic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex flex-row gap-3 items-center"
          >
            {fanfic.title}
            {showComplete && fanfic.completedAt && (
              <CircleCheck className="text-success" size="18" />
            )}
          </a>
        </div>
        <div className="text-sm text-zinc-600">
          {fanfic.authorUrl ? (
            <a
              href={fanfic.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {fanfic.author}
            </a>
          ) : (
            fanfic.author
          )}
        </div>
      </>
    );
  };

  async function handleTranfser(newSectionId: number) {
    updateFic(fanfic.id, { sectionId: newSectionId });
    router.refresh();
  }

  return (
    <Card
      className={`p-2 my-2 bg-accent shadow-md rounded -space-y-4 ${isDragging ? "" : "transition-all duration-300 ease-in-out"}`}
    >
      <CardHeader>
        <div className="flex flex-row justify-between">
          <CardTitle className="flex flex-col mb-4 gap-2">
            <Title showComplete />
          </CardTitle>

          <DrawerDialog
            tooltip="Expand"
            trigger={<ExpandIcon size={20} />}
            title={
              <div className="flex flex-col items-center">
                <Title showComplete={false} />
              </div>
            }
            description={
              <ScrollArea className="overflow-auto max-h-40">
                <Description />
              </ScrollArea>
            }
          >
            <>
              <div className="flex flex-col flex-wrap gap-4 mt-5">
                <Separator />
                <Carousel>
                  <CarouselContent>
                    <TagList />
                  </CarouselContent>
                  <CarouselPrevious
                    variant="ghost"
                    className={cn(isDesktop ? "ml-8" : "")}
                  />
                  <CarouselNext
                    variant="ghost"
                    className={cn(isDesktop ? "mr-8" : "")}
                  />
                </Carousel>
              </div>
            </>
          </DrawerDialog>
        </div>
      </CardHeader>

      <div>
        <CardDescription
          className={cn(
            `w-[50%] h-20 overflow-hidden text-ellipsis ml-6 transition-all duration-300 ease-in-out ${isDragging ? "h-0 opacity-0" : "h-20 opacity-100"}`
          )}
        >
          <Description />
        </CardDescription>
        <CardFooter className="flex justify-end gap-2 items-center p-6">
          <DropdownMenu
            tooltip="Transfer fanfic"
            trigger={<Trigger />}
            items={transferableSections.map((section) => ({
              title: section.displayName,
              onSelect: () => handleTranfser(section.id),
            }))}
          />

          <SendToKindle fanfic={fanfic} />
        </CardFooter>
      </div>
    </Card>
  );
}
