"use server";

import { db } from "./db";
import { epubCache } from "./schema";
import { eq, and } from "drizzle-orm";

export interface EpubCacheEntry {
  id: number;
  fanficId: number;
  userId: string;
  epubUrl: string;
  md5Hash: string;
  ao3UpdatedAt: Date;
  chapterCount: string | null;
  chapterBoundaries: Record<string, number> | null;
  totalBytes: number | null;
  creationTime: Date;
  updateTime: Date | null;
}

/**
 * Get cached EPUB for a user's fanfic
 */
export async function getCachedEpub(
  userId: string,
  fanficId: number
): Promise<EpubCacheEntry | null> {
  const [cached] = await db
    .select()
    .from(epubCache)
    .where(and(eq(epubCache.userId, userId), eq(epubCache.fanficId, fanficId)))
    .limit(1);

  return cached || null;
}

/**
 * Get cached EPUB by MD5 hash
 */
export async function getCachedEpubByHash(
  md5Hash: string
): Promise<EpubCacheEntry | null> {
  const [cached] = await db
    .select()
    .from(epubCache)
    .where(eq(epubCache.md5Hash, md5Hash))
    .limit(1);

  return cached || null;
}

/**
 * Create or update EPUB cache entry
 */
export async function upsertEpubCache(data: {
  userId: string;
  fanficId: number;
  epubUrl: string;
  md5Hash: string;
  ao3UpdatedAt: Date;
  chapterCount?: string;
  chapterBoundaries?: Record<string, number>;
  totalBytes?: number;
}): Promise<EpubCacheEntry> {
  // Check if entry exists
  const existing = await getCachedEpub(data.userId, data.fanficId);

  if (existing) {
    // Update existing entry
    const [updated] = await db
      .update(epubCache)
      .set({
        epubUrl: data.epubUrl,
        md5Hash: data.md5Hash,
        ao3UpdatedAt: data.ao3UpdatedAt,
        chapterCount: data.chapterCount || null,
        chapterBoundaries: data.chapterBoundaries || null,
        totalBytes: data.totalBytes || null,
        updateTime: new Date(),
      })
      .where(eq(epubCache.id, existing.id))
      .returning();

    return updated;
  } else {
    // Insert new entry
    const [inserted] = await db
      .insert(epubCache)
      .values({
        userId: data.userId,
        fanficId: data.fanficId,
        epubUrl: data.epubUrl,
        md5Hash: data.md5Hash,
        ao3UpdatedAt: data.ao3UpdatedAt,
        chapterCount: data.chapterCount || null,
        chapterBoundaries: data.chapterBoundaries || null,
        totalBytes: data.totalBytes || null,
      })
      .returning();

    return inserted;
  }
}

/**
 * Delete EPUB cache entry
 */
export async function deleteEpubCache(
  userId: string,
  fanficId: number
): Promise<boolean> {
  const result = await db
    .delete(epubCache)
    .where(and(eq(epubCache.userId, userId), eq(epubCache.fanficId, fanficId)))
    .returning();

  return result.length > 0;
}

/**
 * Check if cached EPUB is still valid (AO3 hasn't updated)
 */
export async function isCacheValid(
  cached: EpubCacheEntry,
  fanficUpdatedAt: Date
): Promise<boolean> {
  return cached.ao3UpdatedAt.getTime() >= fanficUpdatedAt.getTime();
}
