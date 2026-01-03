"use server";

import { db } from "./db";
import { koreaderSyncState, sectionFanfics } from "./schema";
import { eq, and } from "drizzle-orm";

export interface KOReaderSyncState {
  id: number;
  userId: string;
  deviceId: string;
  documentHash: string;
  fanficId: number | null;
  progress: number;
  percentage: number;
  lastSyncAt: Date;
  creationTime: Date;
  updateTime: Date | null;
}

/**
 * Get sync state for a specific document
 */
export async function getSyncState(
  userId: string,
  documentHash: string
): Promise<KOReaderSyncState | null> {
  const [state] = await db
    .select()
    .from(koreaderSyncState)
    .where(
      and(
        eq(koreaderSyncState.userId, userId),
        eq(koreaderSyncState.documentHash, documentHash)
      )
    )
    .limit(1);

  return state || null;
}

/**
 * Upsert sync state (create or update)
 */
export async function upsertSyncState(data: {
  userId: string;
  deviceId: string;
  documentHash: string;
  fanficId?: number;
  progress: number;
  percentage: number;
}): Promise<KOReaderSyncState> {
  const existing = await getSyncState(data.userId, data.documentHash);

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(koreaderSyncState)
      .set({
        deviceId: data.deviceId,
        fanficId: data.fanficId || existing.fanficId,
        progress: data.progress,
        percentage: data.percentage,
        lastSyncAt: new Date(),
        updateTime: new Date(),
      })
      .where(eq(koreaderSyncState.id, existing.id))
      .returning();

    return updated;
  } else {
    // Insert new
    const [inserted] = await db
      .insert(koreaderSyncState)
      .values({
        userId: data.userId,
        deviceId: data.deviceId,
        documentHash: data.documentHash,
        fanficId: data.fanficId || null,
        progress: data.progress,
        percentage: data.percentage,
        lastSyncAt: new Date(),
      })
      .returning();

    return inserted;
  }
}

/**
 * Get fanfic ID from document hash (via epub_cache)
 */
export async function getFanficIdByHash(
  documentHash: string
): Promise<number | null> {
  const { epubCache } = await import("./schema");

  const [cached] = await db
    .select({ fanficId: epubCache.fanficId })
    .from(epubCache)
    .where(eq(epubCache.md5Hash, documentHash))
    .limit(1);

  return cached?.fanficId || null;
}

/**
 * Get sectionFanficId for a user and fanfic
 */
export async function getSectionFanficId(
  userId: string,
  fanficId: number
): Promise<number | null> {
  const [sectionFanfic] = await db
    .select({ id: sectionFanfics.id })
    .from(sectionFanfics)
    .where(
      and(
        eq(sectionFanfics.userId, userId),
        eq(sectionFanfics.fanficId, fanficId)
      )
    )
    .limit(1);

  return sectionFanfic?.id || null;
}
