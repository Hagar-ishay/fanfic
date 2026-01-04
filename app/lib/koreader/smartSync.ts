"use server";

import { db } from "@/db/db";
import { koreaderSyncState, fanfics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { extractEpubMetadata } from "@/app/api/koreader/opds/download/[fanficId]/route";
import logger from "@/logger";

/**
 * Extract chapter number and position from byte offset
 */
export function extractChapterFromByteOffset(
  byteOffset: number,
  chapterBoundaries: Record<string, number>
): {
  chapterNumber: number;
  percentThroughChapter: number;
} {
  const chapters = Object.entries(chapterBoundaries)
    .map(([num, offset]) => ({ number: parseInt(num), offset }))
    .sort((a, b) => a.number - b.number);

  // Find which chapter contains this byte offset
  let currentChapter = chapters[0];
  let nextChapter = chapters[1];

  for (let i = 0; i < chapters.length; i++) {
    if (
      byteOffset >= chapters[i].offset &&
      (!chapters[i + 1] || byteOffset < chapters[i + 1].offset)
    ) {
      currentChapter = chapters[i];
      nextChapter = chapters[i + 1];
      break;
    }
  }

  // Calculate percentage through the chapter
  const chapterStart = currentChapter.offset;
  const chapterEnd = nextChapter ? nextChapter.offset : byteOffset + 1000;
  const chapterSize = chapterEnd - chapterStart;
  const positionInChapter = byteOffset - chapterStart;
  const percentThroughChapter =
    chapterSize > 0 ? positionInChapter / chapterSize : 0;

  return {
    chapterNumber: currentChapter.number,
    percentThroughChapter: Math.max(0, Math.min(1, percentThroughChapter)),
  };
}

/**
 * Extract a text anchor (paragraph) from EPUB at given byte offset
 */
export async function extractTextAnchor(
  epubPath: string,
  byteOffset: number
): Promise<string | null> {
  try {
    const { chapters } = await extractEpubMetadata(epubPath);

    // Find the chapter containing this byte offset
    const chapter = chapters.find((ch, index) => {
      const nextChapter = chapters[index + 1];
      return (
        byteOffset >= ch.byteOffset &&
        (!nextChapter || byteOffset < nextChapter.byteOffset)
      );
    });

    if (!chapter || !chapter.text) {
      return null;
    }

    // Extract a ~200 character snippet around the position
    const positionInChapter = byteOffset - chapter.byteOffset;
    const snippetStart = Math.max(0, positionInChapter - 100);
    const snippetEnd = Math.min(chapter.text.length, positionInChapter + 100);
    const snippet = chapter.text.substring(snippetStart, snippetEnd);

    // Clean up HTML tags for better matching
    const cleanSnippet = snippet.replace(/<[^>]*>/g, " ").trim();

    return cleanSnippet.substring(0, 200);
  } catch (error) {
    logger.error(
      `Failed to extract text anchor: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Save reading position with smart sync data
 */
export async function saveSmartReadingPosition(
  userId: string,
  deviceId: string,
  documentHash: string,
  fanficId: number,
  progress: number,
  percentage: number,
  epubPath?: string
): Promise<void> {
  try {
    // Get fanfic details for chapter count
    const [fanfic] = await db
      .select()
      .from(fanfics)
      .where(eq(fanfics.id, fanficId))
      .limit(1);

    let smartSyncData: {
      currentChapter?: number;
      percentThroughChapter?: number;
      lastReadParagraph?: string;
      totalChapters?: number;
      ao3UpdatedAt?: Date;
    } = {};

    // If we have the EPUB file, extract smart sync data
    if (epubPath) {
      const { chapterBoundaries } = await extractEpubMetadata(epubPath);
      const chapterInfo = extractChapterFromByteOffset(
        progress,
        chapterBoundaries
      );
      const textAnchor = await extractTextAnchor(epubPath, progress);

      smartSyncData = {
        currentChapter: chapterInfo.chapterNumber,
        percentThroughChapter: chapterInfo.percentThroughChapter,
        lastReadParagraph: textAnchor || undefined,
        totalChapters: fanfic?.chapterCount || undefined,
        ao3UpdatedAt: fanfic?.updatedAt || undefined,
      };
    }

    // Check if sync state exists
    const [existing] = await db
      .select()
      .from(koreaderSyncState)
      .where(
        and(
          eq(koreaderSyncState.userId, userId),
          eq(koreaderSyncState.deviceId, deviceId),
          eq(koreaderSyncState.documentHash, documentHash)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(koreaderSyncState)
        .set({
          progress,
          percentage,
          ...smartSyncData,
          lastSyncAt: new Date(),
        })
        .where(eq(koreaderSyncState.id, existing.id));
    } else {
      // Insert new
      await db.insert(koreaderSyncState).values({
        userId,
        deviceId,
        documentHash,
        fanficId,
        progress,
        percentage,
        ...smartSyncData,
        lastSyncAt: new Date(),
      });
    }

    logger.info(
      `Saved smart reading position for fanfic ${fanficId} at chapter ${smartSyncData.currentChapter || "?"}, ${Math.round((smartSyncData.percentThroughChapter || 0) * 100)}%`
    );
  } catch (error) {
    logger.error(
      `Failed to save smart reading position: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Find text snippet in EPUB chapters
 */
export async function findTextInEpub(
  epubPath: string,
  searchText: string
): Promise<{ chapterNumber: number; byteOffset: number } | null> {
  try {
    const { chapters } = await extractEpubMetadata(epubPath);

    // Clean the search text
    const cleanSearchText = searchText.replace(/<[^>]*>/g, " ").trim();

    for (const chapter of chapters) {
      const cleanChapterText = chapter.text.replace(/<[^>]*>/g, " ");

      const index = cleanChapterText.indexOf(cleanSearchText);
      if (index !== -1) {
        // Found! Calculate byte offset
        const byteOffset = chapter.byteOffset + index;
        return {
          chapterNumber: chapter.number,
          byteOffset,
        };
      }

      // Try fuzzy matching (first 50 chars)
      const shortSearch = cleanSearchText.substring(0, 50);
      const fuzzyIndex = cleanChapterText.indexOf(shortSearch);
      if (fuzzyIndex !== -1) {
        const byteOffset = chapter.byteOffset + fuzzyIndex;
        return {
          chapterNumber: chapter.number,
          byteOffset,
        };
      }
    }

    return null;
  } catch (error) {
    logger.error(
      `Failed to find text in EPUB: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Restore reading position intelligently across EPUB updates
 */
export async function restoreSmartReadingPosition(
  userId: string,
  documentHash: string,
  fanficId: number,
  newEpubPath: string
): Promise<number | null> {
  try {
    // Get saved position
    const [saved] = await db
      .select()
      .from(koreaderSyncState)
      .where(
        and(
          eq(koreaderSyncState.userId, userId),
          eq(koreaderSyncState.fanficId, fanficId)
        )
      )
      .limit(1);

    if (!saved) {
      logger.info(`No saved position for fanfic ${fanficId}`);
      return null;
    }

    // Check if EPUB has been updated
    const [fanfic] = await db
      .select()
      .from(fanfics)
      .where(eq(fanfics.id, fanficId))
      .limit(1);

    const epubUpdated =
      saved.ao3UpdatedAt &&
      fanfic?.updatedAt &&
      fanfic.updatedAt > saved.ao3UpdatedAt;

    // If same EPUB version, return exact byte offset
    if (!epubUpdated && saved.documentHash === documentHash) {
      logger.info(
        `EPUB unchanged, using exact position: ${saved.progress} bytes`
      );
      return saved.progress;
    }

    logger.info(
      `EPUB updated, attempting smart position restoration for fanfic ${fanficId}`
    );

    // EPUB was updated - try to restore position intelligently
    const { chapterBoundaries } = await extractEpubMetadata(newEpubPath);

    // Strategy 1: Try to find the exact text anchor
    if (saved.lastReadParagraph) {
      const foundPosition = await findTextInEpub(
        newEpubPath,
        saved.lastReadParagraph
      );
      if (foundPosition) {
        logger.info(
          `Found text anchor in new EPUB at byte ${foundPosition.byteOffset}`
        );
        return foundPosition.byteOffset;
      }
    }

    // Strategy 2: Use chapter + percentage fallback
    if (saved.currentChapter && saved.percentThroughChapter !== null) {
      const chapterKey = saved.currentChapter.toString();
      const chapterStart = chapterBoundaries[chapterKey];

      if (chapterStart !== undefined) {
        const nextChapterKey = (saved.currentChapter + 1).toString();
        const chapterEnd =
          chapterBoundaries[nextChapterKey] || chapterStart + 50000;
        const chapterSize = chapterEnd - chapterStart;

        const estimatedPosition =
          chapterStart + chapterSize * saved.percentThroughChapter;

        logger.info(
          `Using chapter ${saved.currentChapter} + ${Math.round(saved.percentThroughChapter * 100)}% = byte ${Math.round(estimatedPosition)}`
        );
        return Math.round(estimatedPosition);
      }
    }

    // Strategy 3: Last resort - use overall percentage
    logger.warn(
      `Could not restore precise position, using overall percentage: ${Math.round(saved.percentage * 100)}%`
    );
    return saved.progress; // Return saved progress as fallback

  } catch (error) {
    logger.error(
      `Failed to restore smart reading position: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
