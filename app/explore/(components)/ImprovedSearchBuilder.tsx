"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/base/MultiSelect";
import { autocomplete } from "@/explore/(server)/autocomplete";
import { AutoCompleteType } from "@/lib/ao3Client";
import React, { useState, useCallback } from "react";
import { X, Plus, Search, Save } from "lucide-react";
import { SavedSearchSearch } from "@/db/types";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";
interface ImprovedSearchBuilderProps {
  onSearch: (searchParams: SavedSearchSearch) => void;
  onSaveSearch?: (name: string, searchParams: SavedSearchSearch) => void;
  isLoading?: boolean;
}

interface SearchFilter {
  id: string;
  type:
    | "rating"
    | "category"
    | "complete"
    | "sort_column"
    | "fandom"
    | "character"
    | "relationship"
    | "tag"
    | "query";
  label: string;
  value: unknown;
  excluded?: boolean;
}

const filterOptions = [
  {
    type: "query" as const,
    label: "General Search",
    placeholder: "Enter search terms...",
  },
  {
    type: "fandom" as const,
    label: "Fandom",
    placeholder: "Search fandoms...",
  },
  {
    type: "character" as const,
    label: "Character",
    placeholder: "Search characters...",
  },
  {
    type: "relationship" as const,
    label: "Relationship",
    placeholder: "Search relationships...",
  },
  {
    type: "tag" as const,
    label: "Additional Tags",
    placeholder: "Search tags...",
  },
  { type: "rating" as const, label: "Rating" },
  { type: "category" as const, label: "Category" },
  { type: "complete" as const, label: "Status" },
  { type: "sort_column" as const, label: "Sort By" },
];

const staticOptions = {
  rating: [
    { id: "10", name: "General Audiences" },
    { id: "11", name: "Teen And Up Audiences" },
    { id: "12", name: "Mature" },
    { id: "13", name: "Explicit" },
  ],
  category: [
    { id: "21", name: "Gen" },
    { id: "22", name: "F/M" },
    { id: "23", name: "M/M" },
    { id: "116", name: "F/F" },
    { id: "2246", name: "Multi" },
  ],
  complete: [
    { id: "true", name: "Complete" },
    { id: "false", name: "Incomplete" },
  ],
  sort_column: [
    { id: "revised_at", name: "Date Updated" },
    { id: "title_to_sort_on", name: "Title" },
    { id: "authors_to_sort_on", name: "Author" },
    { id: "hits", name: "Hit Count" },
    { id: "kudos_count", name: "Kudos Count" },
    { id: "comments_count", name: "Comment Count" },
    { id: "bookmarks_count", name: "Bookmark Count" },
    { id: "word_count", name: "Word Count" },
  ],
};

export function ImprovedSearchBuilder({
  onSearch,
  onSaveSearch,
  isLoading = false,
}: ImprovedSearchBuilderProps) {
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [searchName, setSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getAutoCompleteTags = useCallback(
    async (value: string, name: string) => {
      try {
        const result = await autocomplete(name, value);
        return result.map((tag) => ({ id: tag, name: tag }));
      } catch (error) {
        logger.error(`Autocomplete error: ${errorMessage(error)}`);
        return [];
      }
    },
    []
  );

  const addFilter = (type: SearchFilter["type"]) => {
    const newFilter: SearchFilter = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: filterOptions.find((opt) => opt.type === type)?.label || type,
      value: type === "query" ? "" : null,
    };
    setFilters((prev) => [...prev, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<SearchFilter>) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const toggleExclude = (id: string) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, excluded: !filter.excluded } : filter
      )
    );
  };

  const executeSearch = () => {
    const searchParams: SavedSearchSearch = {};

    filters.forEach((filter) => {
      if (
        filter.value &&
        (typeof filter.value === "string" ? filter.value.trim() : true) &&
        (!Array.isArray(filter.value) || filter.value.length > 0)
      ) {
        const key = filter.excluded ? `exclude_${filter.type}` : filter.type;

        if (Array.isArray(filter.value)) {
          searchParams[key] = filter.value;
        } else if (typeof filter.value === "object" && filter.value !== null && 'id' in filter.value && 'name' in filter.value) {
          searchParams[key] = filter.value as { id: string; name: string; excluded?: boolean };
        } else if (typeof filter.value === "string" || typeof filter.value === "number") {
          const valueStr = String(filter.value);
          searchParams[key] = {
            id: valueStr,
            name: valueStr,
          };
        }
      }
    });

    onSearch(searchParams);
  };

  const saveSearch = () => {
    if (!searchName.trim() || !onSaveSearch) return;

    const searchParams: SavedSearchSearch = {};
    filters.forEach((filter) => {
      if (
        filter.value &&
        (typeof filter.value === "string" ? filter.value.trim() : true) &&
        (!Array.isArray(filter.value) || filter.value.length > 0)
      ) {
        const key = filter.excluded ? `exclude_${filter.type}` : filter.type;

        if (Array.isArray(filter.value)) {
          searchParams[key] = filter.value;
        } else if (typeof filter.value === "object" && filter.value !== null && 'id' in filter.value && 'name' in filter.value) {
          searchParams[key] = filter.value as { id: string; name: string; excluded?: boolean };
        } else if (typeof filter.value === "string" || typeof filter.value === "number") {
          const valueStr = String(filter.value);
          searchParams[key] = {
            id: valueStr,
            name: valueStr,
          };
        }
      }
    });

    onSaveSearch(searchName.trim(), searchParams);
    setSearchName("");
    setShowSaveDialog(false);
  };

  const renderFilterInput = (filter: SearchFilter) => {
    const filterOption = filterOptions.find((opt) => opt.type === filter.type);

    if (filter.type === "query") {
      return (
        <Input
          placeholder={filterOption?.placeholder}
          value={typeof filter.value === "string" ? filter.value : ""}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          className="flex-1"
        />
      );
    }

    if (["fandom", "character", "relationship", "tag"].includes(filter.type)) {
      return (
        <div className="flex-1">
          <MultiSelect
            name={filter.type as AutoCompleteType}
            label=""
            multiple
            defaultValue={Array.isArray(filter.value) ? filter.value : undefined}
            getOptions={getAutoCompleteTags}
          />
        </div>
      );
    }

    // Static select options
    const options = staticOptions[filter.type as keyof typeof staticOptions];
    if (options) {
      return (
        <Select
          value={
            (filter.value && typeof filter.value === 'object' && 'id' in filter.value 
              ? String(filter.value.id) 
              : typeof filter.value === "string" ? filter.value : "")
          }
          onValueChange={(value) => {
            const option = options.find((opt) => opt.id === value);
            updateFilter(filter.id, {
              value: option ? { id: option.id, name: option.name } : null,
            });
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={`Select ${filter.label.toLowerCase()}...`}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return null;
  };

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold">Advanced Search</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              disabled={filters.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Save Search</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              onClick={executeSearch}
              disabled={isLoading || filters.length === 0}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Search className="h-4 w-4 mr-1 sm:mr-2" />
              {isLoading
                ? isMobile
                  ? "Searching..."
                  : "Searching..."
                : isMobile
                  ? "Search"
                  : "Search"}
            </Button>
          </div>
        </div>

        {showSaveDialog && (
          <Card className="p-3 bg-muted/50">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveSearch}
                  disabled={!searchName.trim()}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="space-y-3">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border bg-background/50"
              >
                <Badge
                  variant={filter.excluded ? "destructive" : "secondary"}
                  className="shrink-0 w-fit"
                >
                  {filter.excluded && "NOT "}
                  {filter.label}
                </Badge>

                <div className="flex-1">{renderFilterInput(filter)}</div>

                <div className="flex gap-1 justify-end">
                  {["fandom", "character", "relationship", "tag"].includes(
                    filter.type
                  ) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExclude(filter.id)}
                      className="px-2 text-xs sm:text-sm"
                    >
                      {filter.excluded ? "Include" : "Exclude"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Add Filter Options */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Add filter:</div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                size="sm"
                onClick={() => addFilter(option.type)}
                disabled={filters.some(
                  (f) =>
                    f.type === option.type &&
                    !["fandom", "character", "relationship", "tag"].includes(
                      option.type
                    )
                )}
                className="text-xs justify-start sm:justify-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
