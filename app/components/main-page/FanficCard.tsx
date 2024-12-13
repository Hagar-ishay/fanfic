"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Fanfic } from "@/db/types";
import React from "react";
import { FanficHeader } from "@/components/main-page/FanficHeader";
import { cn } from "@/lib/utils";
import { BookUp, BookUp2, CircleCheck, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/base/Tooltip";

export default function FanficCard({
  fanfic,
  isDragging,
  isPending,
}: {
  fanfic: Fanfic;
  isDragging: boolean;
  isPending: boolean;
}) {
  return (
    <div className="relative">
      <Card
        className={cn(
          "my-1 bg-accent shadow-md rounded-lg -space-y-4 hover:shadow-lg border-l-4",
          isDragging ? "" : "transition-all duration-300 ease-in-out"
        )}
      >
        <CardContent>
          <div className="flex flex-row items-center justify-between w-full">
            <div className="truncate flex-grow min-w-0">
              <FanficHeader fanfic={fanfic} showComplete truncate />
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
          {isPending && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
