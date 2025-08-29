"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SavedSearches } from "./SavedSearches";
import { QuickSearch } from "./QuickSearch";
import { ImprovedSearchBuilder } from "./ImprovedSearchBuilder";
import { SearchResults } from "./SearchResults";
import { executeSearch, executeQuickSearch, SearchResult } from "../(server)/search";
import { saveSearch } from "@/db/savedSearches";
import { SavedSearch, SavedSearchSearch } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { SearchBuilder } from "./SearchBuilder";
import { Plus, BookOpen, Search, History } from "lucide-react";

interface ExplorePageProps {
  savedSearches: SavedSearch[];
  userId: string;
}

type SearchResults = {
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
};

export function ExplorePage({ savedSearches, userId }: ExplorePageProps) {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastSearchParams, setLastSearchParams] = useState<SavedSearchSearch | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("quick");
  const { toast } = useToast();

  const handleQuickSearch = (query: string) => {
    startTransition(async () => {
      try {
        const results = await executeQuickSearch(query, 1);
        setSearchResults(results);
        setCurrentPage(1);
        setLastSearchParams({ query: { id: query, name: query } });
        setActiveTab("results");
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to execute search. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleAdvancedSearch = (searchParams: SavedSearchSearch) => {
    startTransition(async () => {
      try {
        const results = await executeSearch(searchParams, 1);
        setSearchResults(results);
        setCurrentPage(1);
        setLastSearchParams(searchParams);
        setActiveTab("results");
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to execute search. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSaveSearch = async (name: string, searchParams: SavedSearchSearch) => {
    try {
      await saveSearch({
        name,
        search: searchParams,
        userId,
      });
      toast({
        title: "Search Saved",
        description: "Your search has been saved successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (!lastSearchParams) return;
    
    startTransition(async () => {
      try {
        const results = await executeSearch(lastSearchParams, page);
        setSearchResults(results);
        setCurrentPage(page);
      } catch (error) {
        console.error("Page change error:", error);
        toast({
          title: "Page Error",
          description: "Failed to load page. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSavedSearchSelect = (search: SavedSearch) => {
    handleAdvancedSearch(search.search);
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Explore Fanfiction</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Search and discover new stories from Archive of Our Own
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="quick" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quick Search</span>
              <span className="sm:hidden">Quick</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Advanced Search</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Saved ({savedSearches.length})</span>
              <span className="sm:hidden">Saved</span>
            </TabsTrigger>
            {searchResults && (
              <TabsTrigger value="results" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Results ({searchResults.totalResults})</span>
                <span className="sm:hidden">Results</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Quick Search</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter keywords to search across titles, summaries, and tags
                  </p>
                </div>
                <QuickSearch onSearch={handleQuickSearch} isLoading={isPending} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <ImprovedSearchBuilder 
              onSearch={handleAdvancedSearch}
              onSaveSearch={handleSaveSearch}
              isLoading={isPending}
            />
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedSearches.length > 0 ? (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Saved Searches</h2>
                      <p className="text-sm text-muted-foreground">
                        Click on any saved search to execute it
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {savedSearches.map((search) => (
                      <Card key={search.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSavedSearchSelect(search)}>
                        <SavedSearches savedSearches={[search]} />
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8 space-y-4">
                  <div className="text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Saved Searches</h3>
                    <p className="text-sm">
                      Create and save search queries to quickly access them later.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab("advanced")}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Search
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {searchResults && (
            <TabsContent value="results" className="space-y-4">
              <SearchResults
                results={searchResults.results}
                totalPages={searchResults.totalPages}
                currentPage={currentPage}
                totalResults={searchResults.totalResults}
                onPageChange={handlePageChange}
                isLoading={isPending}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}