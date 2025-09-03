"use server";
import { db } from "@/db/db";
import { savedSearches } from "@/db/schema";
import { SavedSearchSearch } from "@/db/types";
import * as drizzle from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveSearch({
  id,
  name,
  search,
  userId,
}: {
  id?: number;
  name: string;
  search: SavedSearchSearch;
  userId: string;
}) {
  if (id) {
    return await db
      .update(savedSearches)
      .set({
        name,
        search,
        userId,
      })
      .returning({ id: savedSearches.id });
  } else {
    return await db
      .insert(savedSearches)
      .values({
        name,
        search,
        userId,
      })
      .returning({ id: savedSearches.id });
  }
}

export async function getSavedSearches(userId: string) {
  return await db
    .select()
    .from(savedSearches)
    .where(drizzle.eq(savedSearches.userId, userId));
}

// Cached version with Next.js 15 caching
export async function getSavedSearchesCached(userId: string) {
  "use cache";
  return await db
    .select()
    .from(savedSearches)
    .where(drizzle.eq(savedSearches.userId, userId));
}

export async function deleteSavedSearch(id: number) {
  await db.delete(savedSearches).where(drizzle.eq(savedSearches.id, id));
  revalidatePath(`/explore`);
}
