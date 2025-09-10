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
  userIntegrations,
  fanficIntegrations,
  hasAo3Credentials,
}: {
  fanfic: UserFanfic;
  index: number;
  transferableSections: Section[];
  userIntegrations: any[];
  fanficIntegrations: any[];
  hasAo3Credentials: boolean;
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

    if (!hasAo3Credentials) {
      toast({
        title: "AO3 Account Required",
        description: "Please add your AO3 credentials in Settings to leave kudos.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      setOptimisticKudos(!optimisticKudos);
      const result = await sendKudos({
        externalId: fanfic.externalId,
        sectionId: fanfic.sectionId,
        userFanficId: fanfic.id,
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

  const getUploadStatus = () => {
    if (!fanficIntegrations || fanficIntegrations.length === 0) {
      return {
        icon: BookUp2,
        tooltip: "Not uploaded yet",
        color: "text-muted-foreground/60",
        show: true,
      };
    }

    const latestSync = fanficIntegrations
      .filter((integration) => integration.lastTriggered)
      .reduce(
        (latest, integration) => {
          if (!integration.lastTriggered) return latest;
          if (!latest) return integration.lastTriggered;
          return integration.lastTriggered > latest
            ? integration.lastTriggered
            : latest;
        },
        null as Date | null
      );

    if (!latestSync) {
      return {
        icon: BookUp2,
        tooltip: "Not uploaded yet",
        color: "text-muted-foreground/60",
      };
    }

    const fanficUpdatedAt = new Date(fanfic.updatedAt);
    const hasUpdates = fanficUpdatedAt > latestSync;

    return hasUpdates
      ? {
          icon: BookUp,
          tooltip: "Updates available",
          color: "text-orange-500",
        }
      : null;
  };

  const uploadStatus = getUploadStatus();

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
            userIntegrations={userIntegrations}
            fanficIntegrations={fanficIntegrations}
            trigger={<div hidden ref={triggerRef} />}
          />

          <Card
            className={cn(
              "bg-card/50 border border-border/40 shadow-sm hover:shadow-md hover:bg-card/80 transition-all duration-200 mb-2",
              snapshot.isDragging && "opacity-50 shadow-lg"
            )}
          >
            <CardContent
              className="p-4 sm:p-5"
              onContextMenu={(e) => {
                e.preventDefault();
                triggerRef.current?.click();
              }}
            >
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex-grow min-w-0 flex flex-row items-center gap-4">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing flex-shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <Grip className="h-4 w-4" />
                  </div>
                  <Link
                    href={`/library/sections/${fanfic.sectionId}/fanfics/${fanfic.id}`}
                    className="min-w-0 flex-1 group"
                    onClick={(e) => {
                      if (snapshot.isDragging) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "text-base font-semibold truncate group-hover:text-primary transition-colors",
                          getFont(fanfic.language)
                        )}
                      >
                        {fanfic.title}
                      </div>
                      <div className="text-sm text-muted-foreground/80 truncate font-blokletters-light mt-1">
                        {fanfic.author}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-row gap-3 flex-shrink-0 items-center">
                  <Tooltip
                    description={
                      !hasAo3Credentials
                        ? "Add AO3 credentials in Settings to leave kudos"
                        : optimisticKudos 
                        ? "Remove kudos" 
                        : "Send kudos"
                    }
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending || !hasAo3Credentials}
                      className={cn(
                        "text-muted-foreground hover:text-primary transition-colors p-1.5 h-auto min-w-0 rounded-md",
                        !hasAo3Credentials && "opacity-50 cursor-not-allowed hover:text-muted-foreground"
                      )}
                      onClick={handleKudos}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          optimisticKudos && hasAo3Credentials && "fill-primary text-primary"
                        )}
                      />
                    </Button>
                  </Tooltip>

                  {uploadStatus && (
                    <Tooltip description={uploadStatus.tooltip}>
                      <div className={uploadStatus.color}>
                        <uploadStatus.icon size="16" />
                      </div>
                    </Tooltip>
                  )}
                  {fanfic.completedAt && (
                    <Tooltip description="Completed">
                      <div className="text-green-600">
                        <CircleCheck size="16" />
                      </div>
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
