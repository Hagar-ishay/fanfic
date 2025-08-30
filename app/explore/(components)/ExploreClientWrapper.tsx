"use client";

import React, { useState, useCallback } from "react";
import { ExplorePage } from "./ExplorePage";
import { ExploreTopbarSearch } from "./ExploreTopbarSearch";
import { SetTopbar } from "@/components/base/SetTopbar";
import { Button } from "@/components/ui/button";
import { SearchBuilder } from "./SearchBuilder";
import { PlusIcon } from "lucide-react";
import { SavedSearch } from "@/db/types";
import { SearchResult } from "../(server)/search";

interface ExploreClientWrapperProps {
  savedSearches: SavedSearch[];
  userId: string;
}

type SearchResults = {
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
};

export function ExploreClientWrapper({
  savedSearches,
  userId,
}: ExploreClientWrapperProps) {
  const [searchResultsCallback, setSearchResultsCallback] = useState<
    ((results: SearchResults) => void) | null
  >(null);

  const handleSearchResults = useCallback(
    (results: SearchResults) => {
      if (searchResultsCallback) {
        searchResultsCallback(results);
      }
    },
    [searchResultsCallback]
  );

  const registerCallback = useCallback(
    (callback: (results: SearchResults) => void) => {
      setSearchResultsCallback(() => callback);
    },
    []
  );

  return (
    <div className="flex flex-col bg-gradient-to-br from-background via-muted/10 to-background">
      <SetTopbar segments={[{ label: "Explore", href: "/explore" }]}>
        <ExploreTopbarSearch onSearch={handleSearchResults} />
        {process.env.NODE_ENV === "development" && (
          <SearchBuilder
            trigger={
              <Button>
                <PlusIcon />
              </Button>
            }
          />
        )}
      </SetTopbar>
      <div className="flex-grow">
        <ExplorePage
          savedSearches={savedSearches}
          userId={userId}
          onSearchResults={registerCallback}
        />
      </div>
    </div>
  );
}
