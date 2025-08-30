"use client";

import { SearchDrawer } from "@/components/base/SearchDrawer";
import { SearchTriggerButton } from "@/components/base/SearchTriggerButton";
import { UserFanfic } from "@/db/types";
import { cn, getIsDesktop } from "@/lib/utils";
import { matchSorter } from "match-sorter";
import { DateTime } from "luxon";
import Link from "next/link";

interface LibraryTopbarSearchProps {
  userFanfics: UserFanfic[];
}

export function LibraryTopbarSearch({ userFanfics }: LibraryTopbarSearchProps) {
  const isDesktop = getIsDesktop();

  return (
    <SearchDrawer
      trigger={<SearchTriggerButton />}
      placeholder="Search your library..."
    >
      {(searchInput, closeDrawer) => {
        const matchedFanfics = matchSorter(userFanfics, searchInput, {
          keys: ["title", "author", "sectionName", "tags.*", "editableLabels"],
          threshold: matchSorter.rankings.CONTAINS,
          sorter: (rankedItems) => {
            return rankedItems.sort((a, b) => {
              const keyIndexDiff = a.keyIndex - b.keyIndex;
              if (keyIndexDiff !== 0) return keyIndexDiff;
              const aTime = a.item.updateTime?.getTime() ?? 0;
              const bTime = b.item.updateTime?.getTime() ?? 0;
              return bTime - aTime;
            });
          },
        });

        const groupedFanfics: {
          [key: string]: {
            sectionName: string;
            fanfics: typeof matchedFanfics;
          };
        } = {};

        for (const fanfic of matchedFanfics) {
          const sectionId = fanfic.sectionId;
          if (!groupedFanfics[sectionId]) {
            groupedFanfics[sectionId] = {
              sectionName: fanfic.sectionName,
              fanfics: [],
            };
          }
          groupedFanfics[sectionId].fanfics.push(fanfic);
        }

        return (
          <>
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
                ([sectionId, { sectionName, fanfics }]) => (
                  <div key={sectionId} className="">
                    <h4 className="text-xs font-medium text-muted-foreground px-2">
                      {sectionName}
                    </h4>
                    <div className="space-y-1">
                      {fanfics.map((fanfic) => (
                        <Link
                          href={`/library/sections/${fanfic.sectionId}/fanfics/${fanfic.id}`}
                          key={fanfic.id}
                          className="block p-3 rounded-lg hover:bg-accent/10 transition-all duration-200 ease-in-out border border-transparent hover:border-border/40"
                          onClick={closeDrawer}
                        >
                          <div className="flex items-baseline justify-between mb-1">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {fanfic.title}
                            </h3>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {fanfic.author}
                            </span>
                          </div>

                          <div className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 min-w-0">
                              {fanfic.wordCount && (
                                <span className="flex-shrink-0">
                                  {fanfic.wordCount.toLocaleString()} words
                                </span>
                              )}
                              {(fanfic.completedAt || fanfic.updatedAt) && (
                                <>
                                  <span className="flex-shrink-0">•</span>
                                  {fanfic.completedAt && (
                                    <span className="flex-shrink-0">
                                      Complete
                                    </span>
                                  )}
                                  {fanfic.completedAt && fanfic.updatedAt && (
                                    <span className="flex-shrink-0">•</span>
                                  )}
                                  {fanfic.updatedAt && (
                                    <span className="truncate min-w-0">
                                      Updated{" "}
                                      {DateTime.fromJSDate(
                                        fanfic.updatedAt
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
          </>
        );
      }}
    </SearchDrawer>
  );
}
