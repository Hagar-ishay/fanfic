"use server";
import { getAo3Client } from "@/lib/ao3Client";
import { SavedSearchSearch } from "@/db/types";
import logger from "@/logger";

export interface SearchResult {
  workId: string;
  title: string;
  author: string;
  authorUrl: string;
  summary: string;
  tags: { [category: string]: string[] };
  rating: string;
  category: string;
  status: "complete" | "in-progress";
  chapters: string;
  words: number;
  kudos: number;
  comments: number;
  bookmarks: number;
  hits: number;
  published: Date;
  updated: Date;
  language: string;
  sourceUrl: string;
}

export async function executeSearch(
  searchParams: SavedSearchSearch,
  page = 1
): Promise<{
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}> {
  const ao3Client = await getAo3Client();

  // Parameter mapping from saved search format to AO3 search format
  const parameterMapping: Record<string, string> = {
    rating_ids: "rating_ids",
    category_ids: "category_ids",
    fandom: "fandom_names",
    character: "character_names",
    relationship: "relationship_names",
    tag: "freeform_names",
    complete: "complete",
    sort_column: "sort_column",
    query: "query",
  };

  // Convert search params to AO3 format
  const ao3SearchParams: Record<string, any> = {
    page,
  };

  // Handle single values and arrays
  for (const [key, value] of Object.entries(searchParams)) {
    const ao3ParamName = parameterMapping[key] || key;
    if (Array.isArray(value)) {
      const included = value
        .filter((item) => !item.excluded)
        .map((item) => item.id || item.name);
      const excluded = value
        .filter((item) => item.excluded)
        .map((item) => item.id || item.name);

      if (included.length > 0) {
        ao3SearchParams[ao3ParamName] = included.join(",");
      }
      if (excluded.length > 0) {
        ao3SearchParams[`exclude_${ao3ParamName}`] = excluded.join(",");
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle single value objects
      if (value.excluded) {
        ao3SearchParams[`exclude_${ao3ParamName}`] = value.id || value.name;
      } else {
        ao3SearchParams[ao3ParamName] = value.id || value.name;
      }
    } else {
      // Handle primitive values
      ao3SearchParams[ao3ParamName] = value;
    }
  }

  try {
    const searchResults = await ao3Client.search(ao3SearchParams);
    return searchResults;
  } catch (error) {
    logger.error(`Search error: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error("Failed to execute search. Please try again.");
  }
}

export async function executeQuickSearch(
  query: string,
  page = 1
): Promise<{
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}> {
  return executeSearch(
    {
      query: { id: query, name: query },
    },
    page
  );
}
