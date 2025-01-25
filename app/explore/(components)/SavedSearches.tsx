"use client";

import { ConfirmationModal } from "@/components/base/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { deleteSavedSearch } from "@/db/savedSearches";
import { SavedSearch } from "@/db/types";
import { TrashIcon } from "lucide-react";

export function SavedSearches({
  savedSearches,
}: {
  savedSearches: SavedSearch[];
}) {
  return (
    <Card className="p-6 w-1/3">
      <h2 className="text-md font-bold mb-4">Saved Searches</h2>
      <ScrollArea className="pr-4 h-[400px]">
        <div className="flex flex-col gap-3">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold">{search.name}</div>
                <div className="relative">
                  <ScrollArea className="w-full max-w-sm">
                    <div className="font-blokletters-light text-sm text-muted-foreground whitespace-nowrap pb-2">
                      {JSON.stringify(search.search)}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ConfirmationModal
                  trigger={<TrashIcon className="h-4 w-4" />}
                  onSubmit={async () => {
                    await deleteSavedSearch(search.id);
                    window.location.reload();
                  }}
                  destructive
                  header="Are you sure you want to delete this saved search?"
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
