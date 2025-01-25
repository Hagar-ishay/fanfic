"use server";
import { db } from "@/db/db";
import { savedSearches } from "@/db/schema";
import * as drizzle from "drizzle-orm";

export async function saveSearch({
  name,
  search,
  userId,
}: {
  name: string;
  search: { [key: string]: string };
  userId: string;
}) {
  return await db
    .insert(savedSearches)
    .values({
      name,
      search,
      userId,
    })
    .returning({ id: savedSearches.id });
}

export async function getSavedSearches(userId: string) {
  return await db
    .select()
    .from(savedSearches)
    .where(drizzle.eq(savedSearches.userId, userId));
}

export async function deleteSavedSearch(id: number) {
  return await db.delete(savedSearches).where(drizzle.eq(savedSearches.id, id));
}
