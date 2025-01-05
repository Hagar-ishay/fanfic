"use client";

import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, UserFanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import { Draggable } from "@hello-pangea/dnd";
import { BookUp, BookUp2, CircleCheck, Grip } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

export default function FanficCard({
  fanfic,
  index,
  transferableSections,
}: {
  fanfic: UserFanfic;
  index: number;
  transferableSections: Section[];
}) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable draggableId={`fanfic-${fanfic.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="relative"
        >
          <FanficContextMenu
            sections={transferableSections}
            fanfic={fanfic}
            trigger={<div hidden ref={triggerRef} />}
          />

          <Card
            onContextMenu={(e) => {
              e.preventDefault();
              console.log({ triggerRef });
              triggerRef.current?.click();
            }}
            className={cn(
              "pt-3 pb-3 border-none border-0 shadow-none hover:bg-accent/30",
              snapshot.isDragging
                ? "opacity-50"
                : "transition-all duration-300 ease-in-out"
            )}
          >
            <CardContent className="p-5">
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex-grow min-w-0 flex flex-col whitespace-nowrap text-ellipsis overflow-hidden">
                  <div className="flex flex-row items-center gap-3">
                    <div
                      {...provided.dragHandleProps}
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Button size="icon" variant="ghost">
                        <Grip />
                      </Button>
                    </div>
                    <Link
                      href={`/library/sections/${fanfic.sectionId}/fanfics/${fanfic.id}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="text-md gap-3 font-semibold mt-4 truncate">
                        {fanfic.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {fanfic.author}
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-row gap-2 flex-shrink-0 items-center">
                  {fanfic.lastSent && fanfic.updatedAt > fanfic.lastSent && (
                    <Tooltip description="New update">
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
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
