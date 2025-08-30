"use client";

import {
  DrawerDialog,
  DrawerDialogClose,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { MultiSelect } from "@/components/base/MultiSelect";
import { Select } from "@/components/base/Select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { saveSearch } from "@/db/savedSearches";
import { SavedSearch, SavedSearchSearch } from "@/db/types";
import { autocomplete } from "@/explore/(server)/autocomplete";
import { executeSearch, SearchResult } from "@/explore/(server)/search";
import { useIsMobile } from "@/hooks/use-mobile";
import { AutoCompleteType } from "@/lib/ao3Client";
import { cn } from "@/lib/utils";
import React from "react";
import { useSession } from "next-auth/react";

type SearchResults = {
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
};

export function SearchBuilder({ 
  trigger, 
  savedSearch,
  onSearch
}: { 
  trigger: React.ReactNode; 
  savedSearch?: SavedSearch;
  onSearch?: (params: SavedSearchSearch, results: SearchResults) => void;
}) {
  const isMobile = useIsMobile();
  const { data: session } = useSession({ required: true });
  const user = session?.user;

  if (!user) {
    return null;
  }

  const getAutoCompleteTags = async (value: string, name: string) => {
    const result = await autocomplete(name, value);
    return result.map((tag) => ({ id: tag, name: tag }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entries = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { SearchName, ...filters } = entries;

    const formattedSearch = Object.entries(filters).reduce((acc, [key, value]) => {
      const parsedValue = JSON.parse(value);
      if (parsedValue && (!Array.isArray(parsedValue) || parsedValue.length > 0)) {
        return { ...acc, [key]: parsedValue };
      }
      return acc;
    }, {});

    await saveSearch({
      ...(savedSearch?.id ? { id: savedSearch.id } : {}),
      name: SearchName,
      search: formattedSearch,
      userId: user.id,
    });
  };

  const handleSearchAndSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entries = Object.fromEntries(formData.entries()) as Record<string, string>;
    const { SearchName, ...filters } = entries;

    const formattedSearch = Object.entries(filters).reduce((acc, [key, value]) => {
      const parsedValue = JSON.parse(value);
      if (parsedValue && (!Array.isArray(parsedValue) || parsedValue.length > 0)) {
        return { ...acc, [key]: parsedValue };
      }
      return acc;
    }, {});

    // Save the search first
    await saveSearch({
      ...(savedSearch?.id ? { id: savedSearch.id } : {}),
      name: SearchName,
      search: formattedSearch,
      userId: user.id,
    });

    // Then execute the search if onSearch callback is provided
    if (onSearch) {
      const results = await executeSearch(formattedSearch);
      onSearch(formattedSearch, results);
    }
  };

  const getDefaultValue = (fieldName: string) => {
    if (!savedSearch?.search) return undefined;
    const value = savedSearch.search[fieldName];
    return value ? JSON.stringify(value) : undefined;
  };

  const getArrayValue = (fieldName: string) => {
    if (!savedSearch?.search) return undefined;
    const value = savedSearch.search[fieldName];
    return Array.isArray(value) ? value : value ? [value] : undefined;
  };

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>{trigger}</DrawerDialogTrigger>
      <DrawerDialogContent className={cn("flex flex-col", isMobile ? "h-[100dvh]" : "h-[85vh] max-h-[850px]")}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DrawerDialogHeader className="flex flex-col gap-2 flex-shrink-0">
            <DrawerDialogTitle>
              <div className="flex flex-col gap-2">
                <Input
                  noborder
                  className="font-bold"
                  name="SearchName"
                  placeholder="Name your Search"
                  required
                  defaultValue={savedSearch?.name}
                />
              </div>
            </DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription hidden />
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-5">
              <Select
                label="Rating"
                name={"rating_ids"}
                defaultValue={getDefaultValue("rating_ids")}
                options={[
                  { id: "10", name: "General Audiences" },
                  { id: "11", name: "Teen And Up Audiences" },
                  { id: "12", name: "Mature" },
                  { id: "13", name: "Explicit" },
                ]}
              />
              <Select
                label="Category"
                name={"category_ids"}
                defaultValue={getDefaultValue("category_ids")}
                options={[
                  { id: "21", name: "Gen" },
                  { id: "22", name: "F/M" },
                  { id: "23", name: "M/M" },
                  { id: "116", name: "F/F" },
                  { id: "2246", name: "Multi" },
                ]}
              />
              <Select
                name={"complete"}
                label={"Status"}
                defaultValue={getDefaultValue("complete")}
                options={[
                  { id: "true", name: "Complete" },
                  { id: "false", name: "Incomplete" },
                ]}
              />
              <Separator />
              <MultiSelect
                name={"fandom" as AutoCompleteType}
                label={"Fandoms"}
                multiple
                defaultValue={getArrayValue("fandom")}
                getOptions={getAutoCompleteTags}
              />
              <MultiSelect
                name={"character" as AutoCompleteType}
                label={"Characters"}
                multiple
                defaultValue={getArrayValue("character")}
                getOptions={getAutoCompleteTags}
              />
              <MultiSelect
                name={"relationship" as AutoCompleteType}
                label={"Relationships"}
                defaultValue={getArrayValue("relationship")}
                getOptions={getAutoCompleteTags}
              />
              <MultiSelect
                name={"tag" as AutoCompleteType}
                label={"Additional Tags"}
                multiple
                defaultValue={getArrayValue("tag")}
                getOptions={getAutoCompleteTags}
              />
              <Select
                name={"sort_column"}
                label={"Order By"}
                placeholder="Select an option..."
                defaultValue={getDefaultValue("sort_column")}
                options={[
                  { id: "revised_at", name: "Date Updated" },
                  { id: "title_to_sort_on", name: "Title" },
                  { id: "authors_to_sort_on", name: "Author" },
                  { id: "hits", name: "Hit Count" },
                  { id: "kudos_count", name: "Kudos Count" },
                  { id: "comments_count", name: "Comment Count" },
                  { id: "bookmarks_count", name: "Bookmark Count" },
                  { id: "word_count", name: "Word Count" },
                ]}
              />
            </div>
          </ScrollArea>
          <DrawerDialogFooter className="flex-shrink-0">
            <div className="flex gap-2 w-full">
              <DrawerDialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async (e) => {
                    const form = e.currentTarget.closest("form") as HTMLFormElement;
                    if (!form?.checkValidity()) {
                      e.preventDefault();
                      form?.reportValidity();
                      return;
                    }
                    const fakeEvent = { 
                      preventDefault: () => {}, 
                      currentTarget: form 
                    } as React.FormEvent<HTMLFormElement>;
                    await handleSubmit(fakeEvent);
                  }}
                  className="flex-1"
                >
                  {savedSearch ? "Update" : "Save"}
                </Button>
              </DrawerDialogClose>
              
              {onSearch && (
                <DrawerDialogClose asChild>
                  <Button
                    type="button"
                    onClick={async (e) => {
                      const form = e.currentTarget.closest("form") as HTMLFormElement;
                      if (!form?.checkValidity()) {
                        e.preventDefault();
                        form?.reportValidity();
                        return;
                      }
                      const fakeEvent = { 
                        preventDefault: () => {}, 
                        currentTarget: form 
                      } as React.FormEvent<HTMLFormElement>;
                      await handleSearchAndSave(fakeEvent);
                    }}
                    className="flex-1"
                  >
                    Search & {savedSearch ? "Update" : "Save"}
                  </Button>
                </DrawerDialogClose>
              )}
            </div>
          </DrawerDialogFooter>
        </form>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
