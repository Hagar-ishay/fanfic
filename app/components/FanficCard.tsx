"use client";

import { DrawerDialog } from "@/components/base/DrawerDialog";
import { DropdownMenu } from "@/components/base/Dropdown";
import SendToKindle from "@/components/SendToKindle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TAGS } from "@/consts";
import { Fanfic, Section } from "@/db/types";
import { cn } from "@/lib/utils";
import { updateFic } from "@/server/updater";
import { CircleCheck, CircleChevronRight, ExpandIcon } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const TagList = ({ category }: { category: string }) => {
    const values = fanfic.tags[category];
    return values?.map((value) => (
      <Badge className="w-fit" key={value} title={category.toLowerCase()}>
        {value}
      </Badge>
    ));
  };

  const Description = () => {
    return fanfic.summary?.split("\n").map((line, index) => (
      <span key={index}>
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
            title={<Title showComplete={false} />}
            description={
              <div className="overflow-auto max-h-80 gap-1 flex flex-col mt-1 bg-secondary ml-10 mr-10">
                <Description />
              </div>
            }
          >
            <>
              <div className="flex flex-col flex-wrap gap-2 mt-5">
                <Separator />
                <div className="flex gap-2 flex-row flex-wrap text-xs justify-center">
                  {fanfic.wordCount && (
                    <Badge title="Word Count">
                      Words: {fanfic.wordCount.toLocaleString()}
                    </Badge>
                  )}
                  {fanfic.chapterCount && (
                    <Badge title="Chapter Count">
                      Chapters: {fanfic.chapterCount}
                    </Badge>
                  )}
                  <TagList category={TAGS.RATING} />
                  <TagList category={TAGS.FANDOM} />
                </div>
                <div className="flex gap-2 flex-row flex-wrap justify-center items-center text-xs">
                  <Badge title="Status">
                    {fanfic.completedAt ? <>Complete</> : <>In Progress</>}
                  </Badge>
                  <TagList category={TAGS.CATEGORIES} />
                  <TagList category={TAGS.RELATIONSHIPS} />
                </div>
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
