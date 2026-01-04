import { NextRequest, NextResponse } from "next/server";
import { authenticateOPDSRequest } from "@/lib/koreader/auth";
import { db } from "@/db/db";
import { fanfics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateKOReaderHash } from "@/lib/koreader/md5Hash";
import { getAo3Client } from "@/lib/ao3Client";
import { Readable } from "stream";
import { promises as fs } from "fs";
import * as path from "path";
import logger from "@/logger";

const unlinkAsync = fs.unlink;
const statAsync = fs.stat;
const readFileAsync = fs.readFile;

export const maxDuration = 59;

/**
 * GET /api/koreader/opds/download/[fanficId]
 * Download EPUB (always fresh from AO3, no caching)
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

    // Generate EPUB on-demand (always fresh from AO3)
    logger.info(`Generating fresh EPUB for fanfic ${fanficIdNum}`);

    const { epubBuffer, md5Hash } = await generateEpub(fanfic);

    // Stream the newly generated EPUB
    const stream = Readable.from(epubBuffer);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(fanfic.title)}.epub"`,
        "X-EPUB-MD5": md5Hash, // Include hash for debugging
      },
    });
  } catch (error) {
    logger.error(
      `Error downloading EPUB for fanfic ${fanficId}: ${error instanceof Error ? error.message : String(error)}`
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Generate EPUB from AO3 and return buffer with metadata
 */
async function generateEpub(
  fanfic: typeof fanfics.$inferSelect
): Promise<{
  epubBuffer: Buffer;
  md5Hash: string;
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

    // Read file into buffer
    const epubBuffer = await readFileAsync(downloadPath);

    logger.info(
      `Successfully generated EPUB for fanfic ${fanfic.id} (${stats.size} bytes)`
    );

    // Clean up temp file
    await unlinkAsync(downloadPath).catch(() => {});

    return { epubBuffer, md5Hash };
  } catch (error) {
    // Clean up temp file on error
    await unlinkAsync(downloadPath).catch(() => {});
    throw error;
  }
}

/**
 * Sanitize filename for Content-Disposition header
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9\-_ ]/g, "_");
}
