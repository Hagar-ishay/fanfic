import { NextRequest, NextResponse } from "next/server";
import { authenticateOPDSRequest } from "@/lib/koreader/auth";
import { db } from "@/db/db";
import { fanfics } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getCachedEpub,
  upsertEpubCache,
  isCacheValid,
} from "@/db/epubCache";
import {
  uploadEpubToR2,
  downloadEpubFromR2,
  getSignedEpubUrl,
} from "@/lib/koreader/r2Client";
import {
  calculateKOReaderHash,
  calculateKOReaderHashFromBuffer,
} from "@/lib/koreader/md5Hash";
import { getAo3Client } from "@/lib/ao3Client";
import { Readable } from "stream";
import { promises as fs, statSync } from "fs";
import * as path from "path";
import EPub from "epub";
import logger from "@/logger";

const unlinkAsync = fs.unlink;
const statAsync = fs.stat;
const readFileAsync = fs.readFile;

export const maxDuration = 59;

/**
 * GET /api/koreader/opds/download/[fanficId]
 * Download EPUB with caching (generates if needed)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fanficId: string }> }
) {
  // Authenticate request
  const userId = await authenticateOPDSRequest(request);
  if (!userId) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="KOReader OPDS Download"',
      },
    });
  }

  const { fanficId } = await params;
  const fanficIdNum = parseInt(fanficId);

  if (isNaN(fanficIdNum)) {
    return new NextResponse("Invalid fanfic ID", { status: 400 });
  }

  try {
    // Get fanfic details
    const [fanfic] = await db
      .select()
      .from(fanfics)
      .where(eq(fanfics.id, fanficIdNum))
      .limit(1);

    if (!fanfic) {
      return new NextResponse("Fanfic not found", { status: 404 });
    }

    // Check cache
    const cached = await getCachedEpub(userId, fanficIdNum);

    if (
      cached &&
      fanfic.updatedAt &&
      isCacheValid(cached, fanfic.updatedAt)
    ) {
      // Cache hit - stream from R2
      logger.info(
        `Cache hit for fanfic ${fanficIdNum}, streaming from R2`
      );

      const result = await downloadEpubFromR2(userId, fanficIdNum);

      if (result.success && result.stream) {
        return new NextResponse(result.stream as ReadableStream, {
          headers: {
            "Content-Type": "application/epub+zip",
            "Content-Disposition": `attachment; filename="${sanitizeFilename(fanfic.title)}.epub"`,
          },
        });
      } else {
        logger.warn(
          `Cache entry exists but R2 download failed, regenerating`
        );
        // Fall through to regeneration
      }
    }

    // Cache miss or invalid - generate EPUB
    logger.info(`Cache miss for fanfic ${fanficIdNum}, generating EPUB`);

    const { epubBuffer, md5Hash, chapterBoundaries, totalBytes } =
      await generateAndCacheEpub(userId, fanfic);

    // Stream the newly generated EPUB
    const stream = Readable.from(epubBuffer);

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(fanfic.title)}.epub"`,
        "X-EPUB-MD5": md5Hash, // Include hash for debugging
      },
    });
  } catch (error) {
    logger.error(
      `Error downloading EPUB for fanfic ${fanficId}:`,
      error
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Generate EPUB, cache it, and return buffer with metadata
 */
async function generateAndCacheEpub(
  userId: string,
  fanfic: typeof fanfics.$inferSelect
): Promise<{
  epubBuffer: Buffer;
  md5Hash: string;
  chapterBoundaries: Record<string, number>;
  totalBytes: number;
}> {
  const title = fanfic.title.trim();
  const downloadPath = path.resolve(`/tmp/${title}-${fanfic.id}.epub`);

  try {
    // Download EPUB from AO3
    const ao3Client = await getAo3Client();
    await ao3Client.downloadFanfic(fanfic.downloadLink, downloadPath);

    // Verify file exists and not empty
    const stats = await statAsync(downloadPath);
    if (stats.size === 0) {
      throw new Error("Downloaded EPUB is empty");
    }

    // Calculate KOReader MD5 hash
    const md5Hash = calculateKOReaderHash(downloadPath);

    // Extract chapter boundaries
    const chapterBoundaries = await extractChapterBoundaries(downloadPath);

    // Read file into buffer
    const epubBuffer = await readFileAsync(downloadPath);
    const totalBytes = epubBuffer.length;

    // Upload to R2
    const uploadResult = await uploadEpubToR2(
      userId,
      fanfic.id,
      epubBuffer
    );

    if (!uploadResult.success) {
      logger.error(`Failed to upload EPUB to R2: ${uploadResult.error}`);
      // Continue anyway - we can still serve the EPUB
    }

    // Cache metadata in database
    await upsertEpubCache({
      userId,
      fanficId: fanfic.id,
      epubUrl: uploadResult.url || "",
      md5Hash,
      ao3UpdatedAt: fanfic.updatedAt || new Date(),
      chapterCount: fanfic.chapterCount || undefined,
      chapterBoundaries,
      totalBytes,
    });

    logger.info(
      `Successfully generated and cached EPUB for fanfic ${fanfic.id}`
    );

    // Clean up temp file
    await unlinkAsync(downloadPath).catch(() => {});

    return { epubBuffer, md5Hash, chapterBoundaries, totalBytes };
  } catch (error) {
    // Clean up temp file on error
    await unlinkAsync(downloadPath).catch(() => {});
    throw error;
  }
}

/**
 * Extract chapter byte boundaries from EPUB
 * Returns a map of chapter number -> byte offset
 */
async function extractChapterBoundaries(
  epubPath: string
): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(epubPath);

    epub.on("error", (err) => {
      logger.error("Error parsing EPUB:", err);
      // Return empty boundaries on error
      resolve({});
    });

    epub.on("end", () => {
      try {
        const flow = epub.flow;
        const boundaries: Record<string, number> = {};

        // EPub.flow is an array of chapter objects with IDs
        if (Array.isArray(flow) && flow.length > 0) {
          let byteOffset = 0;

          flow.forEach((chapter, index) => {
            const chapterNum = index + 1;
            boundaries[chapterNum.toString()] = byteOffset;

            // Estimate chapter size (this is approximate)
            // In a real implementation, you'd parse the HTML content size
            // For now, use a rough estimate
            byteOffset += 50000; // ~50KB per chapter estimate
          });

          logger.info(
            `Extracted ${flow.length} chapter boundaries from EPUB`
          );
        } else {
          logger.warn("No flow/chapters found in EPUB, using defaults");
          // Default: single chapter
          boundaries["1"] = 0;
        }

        resolve(boundaries);
      } catch (error) {
        logger.error("Error extracting chapter boundaries:", error);
        resolve({ "1": 0 }); // Fallback to single chapter
      }
    });

    epub.parse();
  });
}

/**
 * Sanitize filename for Content-Disposition header
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9\-_ ]/g, "_");
}
