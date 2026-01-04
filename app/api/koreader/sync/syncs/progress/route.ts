import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { integrations, sectionFanfics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  getSyncState,
  upsertSyncState,
  getFanficIdByHash,
  getSectionFanficId,
} from "@/db/koreaderSync";
import {
  resolveProgressConflict,
} from "@/lib/koreader/progressMapping";
import logger from "@/logger";

export const maxDuration = 59;

/**
 * Authenticate KOSync request
 */
async function authenticateKOSync(
  request: NextRequest
): Promise<string | null> {
  const username = request.headers.get("x-auth-user");
  const authKey = request.headers.get("x-auth-key");

  if (!username || !authKey) {
    return null;
  }

  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, username),
        eq(integrations.type, "koreader_sync"),
        eq(integrations.isActive, true)
      )
    )
    .limit(1);

  if (!integration) {
    return null;
  }

  const config = integration.config as { passwordHash?: string };
  if (!config.passwordHash) {
    return null;
  }

  // Verify auth key (handle both MD5 and plaintext)
  let isValid = false;
  if (authKey.length === 32 && /^[a-f0-9]+$/i.test(authKey)) {
    isValid = authKey.toLowerCase() === config.passwordHash;
  } else {
    isValid = await bcrypt.compare(authKey, config.passwordHash);
  }

  return isValid ? username : null;
}

/**
 * GET /api/koreader/sync/syncs/progress
 * Get progress for a document
 */
export async function GET(request: NextRequest) {
  const userId = await authenticateKOSync(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const document = searchParams.get("document");

    if (!document) {
      return NextResponse.json(
        { message: "Document hash required" },
        { status: 400 }
      );
    }

    // Get KOReader sync state
    const syncState = await getSyncState(userId, document);

    // Get web app progress for comparison
    const fanficId = await getFanficIdByHash(document);
    let webProgress: {
      readingProgress: number;
      currentChapter: number;
      lastReadAt: Date | null;
    } | null = null;

    if (fanficId) {
      const sectionFanficId = await getSectionFanficId(userId, fanficId);
      if (sectionFanficId) {
        const [webState] = await db
          .select({
            readingProgress: sectionFanfics.readingProgress,
            currentChapter: sectionFanfics.currentChapter,
            lastReadAt: sectionFanfics.lastReadAt,
          })
          .from(sectionFanfics)
          .where(eq(sectionFanfics.id, sectionFanficId))
          .limit(1);

        webProgress = webState || null;
      }
    }

    // Determine which progress to return
    let responseProgress: number;
    let responsePercentage: number;
    let responseDevice: string;

    if (syncState && webProgress) {
      // Both exist - resolve conflict
      const winner = resolveProgressConflict(
        {
          percentage: syncState.percentage,
          timestamp: syncState.lastSyncAt,
        },
        {
          percentage: webProgress.readingProgress / 100,
          timestamp: webProgress.lastReadAt || new Date(0),
        }
      );

      if (winner === "state1") {
        // KOReader wins
        responseProgress = syncState.progress;
        responsePercentage = syncState.percentage;
        responseDevice = syncState.deviceId;
      } else {
        // Web app wins - use percentage directly (no chapter boundaries available without caching)
        responseProgress = Math.floor(webProgress.readingProgress * 100); // Estimate
        responsePercentage = webProgress.readingProgress / 100;
        responseDevice = "web";
      }
    } else if (syncState) {
      // Only KOReader state exists
      responseProgress = syncState.progress;
      responsePercentage = syncState.percentage;
      responseDevice = syncState.deviceId;
    } else if (webProgress) {
      // Only web progress exists - use percentage directly
      responseProgress = Math.floor(webProgress.readingProgress * 100); // Estimate
      responsePercentage = webProgress.readingProgress / 100;
      responseDevice = "web";
    } else {
      // No progress anywhere
      responseProgress = 0;
      responsePercentage = 0;
      responseDevice = "unknown";
    }

    return NextResponse.json(
      {
        document,
        progress: responseProgress,
        percentage: responsePercentage,
        device: responseDevice,
      },
      {
        headers: {
          "Content-Type": "application/vnd.koreader.v1+json",
        },
      }
    );
  } catch (error) {
    logger.error(
      `KOSync GET progress error: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json(
      { message: "Failed to get progress" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/koreader/sync/syncs/progress
 * Update progress for a document
 */
export async function PUT(request: NextRequest) {
  const userId = await authenticateKOSync(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { document, progress, percentage, device, device_id } = body;

    if (!document || progress === undefined || percentage === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get fanfic ID from document hash
    const fanficId = await getFanficIdByHash(document);

    // Update KOReader sync state
    await upsertSyncState({
      userId,
      deviceId: device_id || device || "unknown",
      documentHash: document,
      fanficId: fanficId || undefined,
      progress,
      percentage,
    });

    // Sync to web app if we have the fanfic
    if (fanficId) {
      const sectionFanficId = await getSectionFanficId(userId, fanficId);
      if (sectionFanficId) {
        // Without caching, we can't accurately convert percentage to chapter
        // Just store the percentage as readingProgress
        const currentChapter = 1; // Default to chapter 1 without boundary data

        // Update web app progress
        await db
          .update(sectionFanfics)
          .set({
            currentChapter,
            readingProgress: Math.round(percentage * 100),
            lastReadAt: new Date(),
          })
          .where(eq(sectionFanfics.id, sectionFanficId));

        logger.info(
          `Synced progress from KOReader: fanfic ${fanficId}, ${Math.round(percentage * 100)}%`
        );
      }
    }

    return NextResponse.json(
      {
        document,
        timestamp: Math.floor(Date.now() / 1000),
        progress,
        percentage,
      },
      {
        headers: {
          "Content-Type": "application/vnd.koreader.v1+json",
        },
      }
    );
  } catch (error) {
    logger.error(
      `KOSync PUT progress error: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json(
      { message: "Failed to update progress" },
      { status: 500 }
    );
  }
}
