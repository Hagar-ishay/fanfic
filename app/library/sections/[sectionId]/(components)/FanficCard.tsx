"use client";

import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, UserFanfic } from "@/db/types";
import { cn, getFont } from "@/lib/utils";
import { FanficContextMenu } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficContextMenu";
import { Draggable } from "@hello-pangea/dnd";
import { BookUp, BookUp2, CircleCheck, Grip, Heart } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";
import { useOptimistic, useTransition } from "react";
import { sendKudos } from "@/library/sections/[sectionId]/(server)/kudosAction";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticKudos, setOptimisticKudos] = useOptimistic(
    fanfic.kudos || false,
    (_, newKudos: boolean) => newKudos
  );

  const handleKudos = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    startTransition(async () => {
      setOptimisticKudos(!optimisticKudos);
      const result = await sendKudos({
        externalId: fanfic.externalId,
        sectionId: fanfic.sectionId,
        fanficId: fanfic.id,
        currentKudos: fanfic.kudos || false,
      });

      if (!result.success) {
        toast({
          title: "Could not leave kudos",
          description: result.message,
          variant: "destructive",
        });
        // Revert optimistic update on error
        setOptimisticKudos(fanfic.kudos || false);
      }
    });
  };

  return (
    <Draggable draggableId={`fanfic-${fanfic.id}`} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="relative">
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
                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing flex-shrink-0">
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
                      <div className={cn("text-md font-semibold truncate", getFont(fanfic.language))}>
                        {fanfic.title}
                      </div>
                      <div className={"text-xs text-muted-foreground truncate font-blokletters-light"}>
                        {fanfic.author}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-row gap-2 flex-shrink-0 items-center">
                  <Tooltip description={optimisticKudos ? "Remove kudos" : "Send kudos"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      className="text-muted-foreground hover:text-primary transition-colors p-0 h-auto min-w-0"
                      onClick={handleKudos}
                    >
                      <Heart className={cn("h-4 w-4", optimisticKudos && "fill-primary text-primary")} />
                    </Button>
                  </Tooltip>

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
