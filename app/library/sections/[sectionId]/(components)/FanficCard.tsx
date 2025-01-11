"use client";

import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, UserFanfic } from "@/db/types";
import { cn, getFont } from "@/lib/utils";
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
            className={cn(
              "pt-3 pb-3 border-none border-0 shadow-none hover:bg-accent/30",
              snapshot.isDragging && "opacity-50"
            )}
          >
            <CardContent
              className="p-5"
              onContextMenu={(e) => {
                e.preventDefault();
                triggerRef.current?.click();
              }}
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex-grow min-w-0 flex flex-row items-center gap-3">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing flex-shrink-0"
                  >
                    <Grip className="h-4 w-4" />
                  </div>
                  <Link
                    href={`/library/sections/${fanfic.sectionId}/fanfics/${fanfic.id}`}
                    className="min-w-0 flex-1"
                    onClick={(e) => {
                      if (snapshot.isDragging) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "text-md font-semibold truncate",
                          getFont(fanfic.language)
                        )}
                      >
                        {fanfic.title}
                      </div>
                      <div
                        className={
                          "text-xs text-muted-foreground truncate font-blokletters-light"
                        }
                      >
                        {fanfic.author}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-row gap-2 flex-shrink-0 items-center">
                  {fanfic.lastSent && fanfic.updatedAt > fanfic.lastSent && (
                    <Tooltip description="New update">
                      <BookUp size="18" />
                    </Tooltip>
                  )}
                  {!fanfic.lastSent && (
                    <Tooltip description="Not uploaded yet">
                      <BookUp2 size="18" />
                    </Tooltip>
                  )}
                  {fanfic.completedAt && (
                    <Tooltip description="Completed">
                      <CircleCheck size="16" />
                    </Tooltip>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
