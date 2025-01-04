"use client";

import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserFanfic } from "@/db/types";
import { cn } from "@/lib/utils";
import { useFanficTransition } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficTransitionContext";
import { Draggable } from "@hello-pangea/dnd";
import { BookUp, BookUp2, CircleCheck, Grip, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FanficCard({
  fanfic,
  index,
}: {
  fanfic: UserFanfic;
  index: number;
}) {
  const { isPending } = useFanficTransition();

  return (
    <Draggable draggableId={`fanfic-${fanfic.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="relative"
        >
          <Card
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
              {isPending(fanfic.id) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
