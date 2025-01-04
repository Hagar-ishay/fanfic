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
import { SearchIcon } from "lucide-react";
import { matchSorter } from "match-sorter";
import Link from "next/link";
import React from "react";
import { DateTime } from "luxon";

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

  const matchedFanfics = matchSorter(userFanfics, searchInput, {
    keys: [
      "fanfics.title",
      "fanfics.author",
      "sections.name",
      "fanfics.tags.*",
      "section_fanfics.editableLabels",
      "fanfics.summary",
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

  return (
    <div className="relative max-w-60 min-w-0 w-full">
      <DrawerDialog>
        <DrawerDialogTrigger>
          <Button
            variant="outline"
            className="pl-8 text-sm text-muted-foreground cursor-text pr-10"
          >
            Search Library...
            <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
          </Button>
        </DrawerDialogTrigger>
        <DrawerDialogContent className="p-4 h-full">
          <DrawerDialogHeader hidden>
            <DrawerDialogTitle></DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDescription hidden></DrawerDescription>
          <div className="relative">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus
              type="search"
              placeholder="Type to search..."
              className="w-full py-3 pl-10 pr-4 bg-background border border-input rounded-xl shadow-sm text-sm transition-colors hover:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent text-muted-foreground caret-muted-foreground/50"
            />
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 select-none opacity-50 " />
          </div>
          <div className="mt-4 space-y-2">
            {matchedFanfics.map((fanfic) => (
              <Link
                href={`/library/sections/${fanfic.sections.id}/fanfics/${fanfic.section_fanfics.id}`}
                key={fanfic.section_fanfics.id}
                className="block p-3 rounded-lg hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {fanfic.fanfics.title}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    {fanfic.sections.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{fanfic.fanfics.author}</span>
                  {fanfic.fanfics.wordCount && (
                    <span>
                      • {fanfic.fanfics.wordCount.toLocaleString()} words
                    </span>
                  )}
                  {fanfic.fanfics.completedAt && <span>• Completed</span>}
                  {fanfic.fanfics.updatedAt && (
                    <span>
                      • Updated{" "}
                      {DateTime.fromJSDate(
                        fanfic.fanfics.updatedAt
                      ).toRelative()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
