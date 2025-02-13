"use client";

import { ConfirmationModal } from "@/components/base/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { deleteSavedSearch } from "@/db/savedSearches";
import { SavedSearch, SavedSearchSearch } from "@/db/types";
import { TrashIcon } from "lucide-react";

export function SavedSearches({
  savedSearches,
}: {
  savedSearches: SavedSearch[];
}) {
  const parseSearch = (value: SavedSearchSearch[keyof SavedSearchSearch]) => {
    if (Array.isArray(value)) {
      return value.map((item) => ({
        text: item.name,
        excluded: item.excluded,
      }));
    }
    return [{ text: value.name, excluded: false }];
  };

  return (
    <ScrollArea className="pr-4">
      <div className="flex flex-col gap-3">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between gap-2 p-2 rounded-md group"
          >
            <div className="flex flex-col gap-2">
              <div className="font-bold">{search.name}</div>
              <div className="relative">
                <ScrollArea className="w-full max-w-sm">
                  <div className="font-blokletters-light text-sm text-muted-foreground pb-2 grid grid-rows-1 gap-1.5">
                    {Object.entries(search.search).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2 ">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground/70 w-[100px] shrink-0 pt-1">
                          {key}
                        </div>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {parseSearch(value).map((item, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-sm text-sm inline-flex items-center
                                  ${
                                    item.excluded
                                      ? "bg-destructive/20 text-destructive line-through"
                                      : "bg-muted"
                                  }`}
                            >
                              {item.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ConfirmationModal
                trigger={
                  <Button variant="ghost" className="h-4 w-4">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                }
                onSubmit={async () => {
                  await deleteSavedSearch(search.id);
                }}
                destructive
                header="Are you sure you want to delete this saved search?"
              />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
