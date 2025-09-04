"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Section as DbSection } from "@/db/types";
import { SectionContextMenu } from "@/library/(components)/SectionContextMenu";
import { ChevronRight } from "lucide-react";
import { useRef, memo } from "react";

const SectionComponent = memo(function Section({
  section,
}: {
  section: DbSection;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Card
        className="cursor-pointer bg-card/80 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:bg-accent/30 transition-all duration-200 relative group"
        onContextMenu={(e) => {
          e.preventDefault();
          triggerRef.current?.click();
        }}
      >
        <CardContent className="flex items-center py-5 px-4 sm:px-6 justify-between min-w-0">
          <div className="flex items-center min-w-0 flex-1">
            <div
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <SectionContextMenu
                section={section}
                trigger={<div hidden ref={triggerRef} />}
              />
            </div>
            <span className="pl-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {section.name}
            </span>
          </div>
          <ChevronRight className="ml-2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </CardContent>
      </Card>
    </>
  );
});

export const Section = SectionComponent;
