"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Section as DbSection } from "@/db/types";
import { SectionContextMenu } from "@/library/(components)/SectionContextMenu";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";

export function Section({
  section,
  transferableSections,
}: {
  section: DbSection;
  transferableSections: DbSection[];
}) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Card
        className="cursor-pointer p-4 border-none border-0 shadow-none hover:bg-accent/50 transition-colors relative"
        onContextMenu={(e) => {
          e.preventDefault();
          triggerRef.current?.click();
        }}
      >
        <CardContent className="flex items-center py-4 pt-5 px-3 justify-between">
          <div className="flex items-center">
            <div
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <SectionContextMenu
                section={section}
                transferableSections={transferableSections}
                trigger={<div hidden ref={triggerRef} />}
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
