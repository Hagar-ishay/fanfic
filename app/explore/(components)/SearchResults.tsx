"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchResult } from "../(server)/search";
import { BookOpen, User, Clock, Heart, MessageCircle, Bookmark, Eye } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddToLibraryButton } from "@/components/base/AddToLibraryButton";

interface Section {
  id: number;
  name: string;
  parentId: number | null;
}

interface UserSettings {
  id?: number;
  activeIntegrationId: number | null;
  defaultSectionId: number | null;
  languageCode: string;
  enableTranslation: boolean;
}

interface SearchResultsProps {
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  sections: Section[];
  userId: string;
  userSettings: UserSettings;
  userFanficIds: Set<string>;
}

export function SearchResults({ 
  results, 
  totalPages, 
  currentPage, 
  totalResults, 
  onPageChange, 
  isLoading = false,
  sections,
  userId,
  userSettings,
  userFanficIds
}: SearchResultsProps) {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading search results...</div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No results found. Try adjusting your search criteria.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {totalResults.toLocaleString()} results found
        </h2>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <ScrollArea className="h-[400px] sm:h-[600px]">
        <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
          {results.map((result) => (
            <SearchResultCard 
              key={result.workId} 
              result={result}
              sections={sections}
              userId={userId}
              userSettings={userSettings}
              userFanficIds={userFanficIds}
            />
          ))}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:inline-flex"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {/* Page numbers - show fewer on mobile */}
          {[...Array(Math.min(isMobile ? 3 : 5, totalPages))].map((_, i) => {
            const pageNumber = Math.max(1, currentPage - (isMobile ? 1 : 2)) + i;
            if (pageNumber > totalPages) return null;
            
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className="min-w-[40px]"
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:inline-flex"
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ 
  result, 
  sections, 
  userId, 
  userSettings,
  userFanficIds 
}: { 
  result: SearchResult;
  sections: Section[];
  userId: string;
  userSettings: UserSettings;
  userFanficIds: Set<string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const isInLibrary = userFanficIds.has(result.workId);

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-2 sm:space-y-3">
        {/* Title and Author */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-base sm:text-lg leading-tight flex-1">
              <a 
                href={result.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {result.title}
              </a>
            </h3>
            {isInLibrary && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                In Library
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            <a 
              href={result.authorUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {result.author}
            </a>
          </p>
        </div>

        {/* Summary */}
        {result.summary && (
          <div className="text-xs sm:text-sm">
            <p className={`${!isExpanded && result.summary.length > (isMobile ? 100 : 200) ? 'line-clamp-2 sm:line-clamp-3' : ''}`}>
              {result.summary}
            </p>
            {result.summary.length > (isMobile ? 100 : 200) && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="space-y-1 sm:space-y-2">
          {Object.entries(result.tags).slice(0, isMobile ? 2 : 4).map(([category, tagList]) => (
            tagList.length > 0 && (
              <div key={category} className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground capitalize min-w-fit">
                  {category}:
                </span>
                {tagList.slice(0, isMobile ? 3 : 5).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tagList.length > (isMobile ? 3 : 5) && (
                  <Badge variant="secondary" className="text-xs">
                    +{tagList.length - (isMobile ? 3 : 5)} more
                  </Badge>
                )}
              </div>
            )
          ))}
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="truncate">{result.words.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="truncate">{result.chapters} chapters</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span className="truncate">{result.kudos.toLocaleString()} kudos</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span className="truncate">{result.comments.toLocaleString()} comments</span>
          </div>
          {!isMobile && (
            <>
              <div className="flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                <span className="truncate">{result.bookmarks.toLocaleString()} bookmarks</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="truncate">{result.hits.toLocaleString()} hits</span>
              </div>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
          <Badge variant="outline" className="text-xs">{result.rating}</Badge>
          <Badge variant="outline" className="text-xs">{result.category}</Badge>
          <Badge variant="outline" className="text-xs">{result.status}</Badge>
          <Badge variant="outline" className="text-xs">{result.language}</Badge>
          {!isMobile && (
            <Badge variant="outline" className="text-xs">
              Updated: {new Date(result.updated).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Add to Library Button */}
        <div className="flex justify-end pt-2">
          {!isInLibrary ? (
            <AddToLibraryButton
              searchResult={result}
              sections={sections}
              userId={userId}
              defaultSectionId={userSettings.defaultSectionId}
              userSettingsId={userSettings.id}
            />
          ) : (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Already in your library
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}