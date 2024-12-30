"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Section as DbSection } from "@/db/types";
import { SectionContextMenu } from "@/library/(components)/SectionContextMenu";
import { ChevronRight, EllipsisVertical, Loader2 } from "lucide-react";
import { useTransitionStore } from "@/store";

export function Section({
  section,
  transferableSections,
}: {
  section: DbSection;
  transferableSections: DbSection[];
}) {
  const isPending = useTransitionStore((state) => state.isPending);

  return (
    <>
      <Card className="cursor-pointer p-4 border-none border-0 shadow-none hover:bg-accent/50 transition-colors relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <CardContent className="flex items-center py-4 pt-5 px-3 justify-between">
          <div className="flex items-center">
            <div onClick={(e) => e.preventDefault()}>
              <SectionContextMenu
                section={section}
                transferableSections={transferableSections}
                trigger={
                  <Button size="icon" variant="extraGhost">
                    <EllipsisVertical className="-ml-5" />
                  </Button>
                }
              />
            </div>
            <span className="pl-2 text-lg font-semibold text-foreground/90">
              {section.displayName}
            </span>
          </div>
          <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
      <Separator className="opacity-50" />
    </>
  );
}
