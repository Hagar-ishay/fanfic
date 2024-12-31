"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserFanfic } from "@/db/types";
import React from "react";
import { cn } from "@/lib/utils";
import {
  BookUp,
  BookUp2,
  CircleCheck,
  Grid,
  Grip,
  Loader2,
} from "lucide-react";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";

export default function FanficCard({
  fanfic,
  isDragging,
  isPending,
}: {
  fanfic: UserFanfic;
  isDragging: boolean;
  isPending: boolean;
}) {
  return (
    <div className="relative">
      <Card
        className={cn(
          "cursor-pointer pt-3 pb-3 border-none border-0 shadow-none hover:bg-accent/30 transition-colors",
          isDragging ? "" : "transition-all duration-300 ease-in-out"
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex-grow min-w-0 flex flex-col whitespace-nowrap text-ellipsis overflow-hidden">
              <div className="flex flex-row items-center gap-3">
                <Button size="icon" variant="ghost">
                  <Grip />
                </Button>
                <div>
                  <div className="text-md gap-3 font-semibold mt-4 truncate">
                    {fanfic.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {fanfic.author}
                  </div>
                </div>
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
          {isPending && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
