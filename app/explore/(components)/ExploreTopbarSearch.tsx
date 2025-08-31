"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { SearchDrawer } from "@/components/base/SearchDrawer";
import { SearchTriggerButton } from "@/components/base/SearchTriggerButton";
import { executeQuickSearch, SearchResult } from "../(server)/search";
import { useToast } from "@/hooks/use-toast";
import logger from "@/logger";

interface ExploreTopbarSearchProps {
  onSearch: (results: {
    results: SearchResult[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
  }) => void;
}

export function ExploreTopbarSearch({ onSearch }: ExploreTopbarSearchProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleExploreSearch = (query: string, closeDrawer?: () => void) => {
    logger.info("handleExploreSearch called with query: " + query);
    if (!query.trim()) {
      logger.info("Query is empty, returning");
      return;
    }

    startTransition(async () => {
      try {
        logger.info("Starting search for: " + query.trim());
        const results = await executeQuickSearch(query.trim(), 1);
        logger.info("Search results: " + JSON.stringify(results));
        onSearch(results);
        closeDrawer?.();

        // Navigate to explore page if not already there
        if (window.location.pathname !== "/explore") {
          window.location.href = "/explore";
        }
      } catch (error) {
        logger.error(`Search error: ${error instanceof Error ? error.message : String(error)}`);
        toast({
          title: "Search Error",
          description: "Failed to execute search. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <SearchDrawer
      trigger={<SearchTriggerButton />}
      placeholder="Quick search fanfictions..."
    >
      {(searchInput, closeDrawer) => (
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExploreSearch(searchInput, closeDrawer);
            }}
            className="flex flex-col gap-2"
          >
            <Button
              type="submit"
              disabled={isPending || !searchInput.trim()}
              className="w-full"
              size="lg"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              {isPending ? "Searching..." : "Search Fanfictions"}
            </Button>
          </form>
        </div>
      )}
    </SearchDrawer>
  );
}
