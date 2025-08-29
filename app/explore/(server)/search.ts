"use server";
import { getAo3Client } from "@/lib/ao3Client";
import { SavedSearchSearch } from "@/db/types";

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

export async function executeSearch(searchParams: SavedSearchSearch, page = 1): Promise<{
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}> {
  const ao3Client = await getAo3Client();
  
  // Convert search params to AO3 format
  const ao3SearchParams: Record<string, any> = {
    page,
  };

  // Handle single values and arrays
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      // Handle excluded tags
      const included = value.filter(item => !item.excluded).map(item => item.id || item.name);
      const excluded = value.filter(item => item.excluded).map(item => item.id || item.name);
      
      if (included.length > 0) {
        ao3SearchParams[key] = included.join(',');
      }
      if (excluded.length > 0) {
        ao3SearchParams[`exclude_${key}`] = excluded.join(',');
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle single value objects
      if (value.excluded) {
        ao3SearchParams[`exclude_${key}`] = value.id || value.name;
      } else {
        ao3SearchParams[key] = value.id || value.name;
      }
    } else {
      // Handle primitive values
      ao3SearchParams[key] = value;
    }
  }

  try {
    const searchResults = await ao3Client.search(ao3SearchParams);
    return searchResults;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to execute search. Please try again.");
  }
}

export async function executeQuickSearch(query: string, page = 1): Promise<{
  results: SearchResult[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}> {
  return executeSearch({
    query: { id: query, name: query }
  }, page);
}