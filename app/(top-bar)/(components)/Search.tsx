"use client";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";
import { DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Fanfic, Section, SectionFanfic } from "@/db/types";
import { cn, getIsDesktop } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { DateTime } from "luxon";
import { matchSorter } from "match-sorter";
import Link from "next/link";
import React from "react";

export function Search({
  userFanfics,
}: {
  userFanfics: {
    sections: Section;
    fanfics: Fanfic;
    section_fanfics: SectionFanfic;
  }[];
}) {
  const [searchInput, setSearchInput] = React.useState("");
  const isDesktop = getIsDesktop();

  const matchedFanfics = matchSorter(userFanfics, searchInput, {
    keys: [
      "fanfics.title",
      "fanfics.author",
      "sections.name",
      "fanfics.tags.*",
      "section_fanfics.editableLabels",
    ],
    threshold: matchSorter.rankings.CONTAINS,
    sorter: (rankedItems) => {
      return rankedItems.sort((a, b) => {
        // First sort by keyIndex (which key matched)
        const keyIndexDiff = a.keyIndex - b.keyIndex;
        if (keyIndexDiff !== 0) return keyIndexDiff;

        // If keyIndex is the same, sort by updatedAt (most recent first)
        const aTime = a.item.section_fanfics.updateTime?.getTime() ?? 0;
        const bTime = b.item.section_fanfics.updateTime?.getTime() ?? 0;
        return bTime - aTime; // Descending order (newer first)
      });
    },
  });

  const groupedFanfics: {
    [key: string]: { section: Section; fanfics: typeof matchedFanfics };
  } = {};

  for (const fanfic of matchedFanfics) {
    const sectionId = fanfic.sections.id;
    if (!groupedFanfics[sectionId]) {
      groupedFanfics[sectionId] = {
        section: fanfic.sections,
        fanfics: [],
      };
    }
    groupedFanfics[sectionId].fanfics.push(fanfic);
  }

  return (
    <div className="relative max-w-60 min-w-0 w-full">
      <DrawerDialog>
        <DrawerDialogTrigger asChild>
          <Button
            variant="outline"
            className="pl-8 text-sm text-muted-foreground cursor-text pr-10"
          >
            Search Library...
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
          </Button>
        </DrawerDialogTrigger>
        <DrawerDialogContent className={cn("p-4", isDesktop ? "" : "h-full")}>
          <DrawerDialogHeader hidden>
            <DrawerDialogTitle></DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDescription></DrawerDescription>
          <div className="relative">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus
              type="search"
              placeholder="Type to search..."
              className={cn(
                "w-full pr-4 bg-background border border-input rounded-xl shadow-sm text-sm transition-colors hover:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent text-muted-foreground caret-muted-foreground/50",
                isDesktop ? "py-2 pl-9" : "py-3 pl-10"
              )}
            />
            <SearchIcon
              className={cn(
                "pointer-events-none absolute left-3 size-4 top-1/2 -translate-y-1/2 select-none opacity-50"
              )}
            />
          </div>
          {searchInput && (
            <div
              className={cn(
                "px-2 text-sm text-muted-foreground",
                isDesktop ? "mt-0" : "mt-4"
              )}
            >
              {matchedFanfics.length} result
              {matchedFanfics.length !== 1 ? "s" : ""}
            </div>
          )}
          <div
            className={cn(
              "space-y-6 overflow-y-auto pr-2",
              isDesktop
                ? "mt-0 max-h-[600px]"
                : "mt-4 max-h-[calc(100vh-200px)]"
            )}
          >
            {Object.entries(groupedFanfics).map(
              ([sectionId, { section, fanfics }]) => (
                <div key={sectionId} className="">
                  <h4 className="text-xs font-medium text-muted-foreground px-2">
                    {section.name}
                  </h4>
                  <div className="space-y-1">
                    {fanfics.map((fanfic) => (
                      <Link
                        href={`/library/sections/${fanfic.sections.id}/fanfics/${fanfic.section_fanfics.id}`}
                        key={fanfic.section_fanfics.id}
                        className="block p-3 rounded-lg hover:bg-accent/10 transition-all duration-200 ease-in-out border border-transparent hover:border-border/40"
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {fanfic.fanfics.title}
                          </h3>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {fanfic.fanfics.author}
                          </span>
                        </div>

                        <div className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2 min-w-0">
                            {fanfic.fanfics.wordCount && (
                              <span className="flex-shrink-0">
                                {fanfic.fanfics.wordCount.toLocaleString()}{" "}
                                words
                              </span>
                            )}
                            {(fanfic.fanfics.completedAt ||
                              fanfic.fanfics.updatedAt) && (
                              <>
                                <span className="flex-shrink-0">•</span>
                                {fanfic.fanfics.completedAt && (
                                  <span className="flex-shrink-0">
                                    Complete
                                  </span>
                                )}
                                {fanfic.fanfics.completedAt &&
                                  fanfic.fanfics.updatedAt && (
                                    <span className="flex-shrink-0">•</span>
                                  )}
                                {fanfic.fanfics.updatedAt && (
                                  <span className="truncate min-w-0">
                                    Updated{" "}
                                    {DateTime.fromJSDate(
                                      fanfic.fanfics.updatedAt
                                    ).toRelative()}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
