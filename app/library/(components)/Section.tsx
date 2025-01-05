"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Section as DbSection } from "@/db/types";
import { SectionContextMenu } from "@/library/(components)/SectionContextMenu";
import { ChevronRight, EllipsisVertical, Loader2 } from "lucide-react";

export function Section({
  section,
  transferableSections,
}: {
  section: DbSection;
  transferableSections: DbSection[];
}) {
  return (
    <>
      <Card className="cursor-pointer p-4 border-none border-0 shadow-none hover:bg-accent/50 transition-colors relative">
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
              {section.name}
            </span>
          </div>
          <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
      <Separator className="opacity-50" />
    </>
  );
}
