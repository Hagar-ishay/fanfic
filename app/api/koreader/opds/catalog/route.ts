import { NextRequest, NextResponse } from "next/server";
import { authenticateOPDSRequest } from "@/lib/koreader/auth";
import {
  generateOPDSCatalog,
  createSelfLink,
  createStartLink,
  createNavigationLink,
  type OPDSEntry,
} from "@/lib/koreader/opdsGenerator";
import { db } from "@/db/db";
import { sections } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export const maxDuration = 59;

/**
 * GET /api/koreader/opds/catalog
 * Root OPDS catalog - lists user's top-level sections
 */
export async function GET(request: NextRequest) {
  // Authenticate request
  const userId = await authenticateOPDSRequest(request);
  if (!userId) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="KOReader OPDS Catalog"',
      },
    });
  }

  try {
    // Get user's top-level sections (those without a parent)
    const userSections = await db
      .select({
        id: sections.id,
        name: sections.name,
        creationTime: sections.creationTime,
      })
      .from(sections)
      .where(and(eq(sections.userId, userId), isNull(sections.parentId)))
      .orderBy(sections.creationTime);

    // Build OPDS feed
    const baseUrl = getBaseUrl(request);
    const catalogUrl = `${baseUrl}/api/koreader/opds/catalog`;

    const entries: OPDSEntry[] = userSections.map((section) => ({
      id: `urn:section:${section.id}`,
      title: section.name,
      updated: section.creationTime,
      links: [
        createNavigationLink(
          `${baseUrl}/api/koreader/opds/sections/${section.id}`,
          section.name
        ),
      ],
    }));

    const feed = {
      id: `urn:uuid:${userId}:root`,
      title: "Fanfiction Library",
      updated: new Date(),
      author: {
        name: "Fanfiction Platform",
        uri: baseUrl,
      },
      links: [createSelfLink(catalogUrl), createStartLink(catalogUrl)],
      entries,
    };

    const xml = generateOPDSCatalog(feed);

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/atom+xml;profile=opds-catalog;kind=navigation",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error generating OPDS catalog:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Get base URL from request
 */
function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || request.nextUrl.host;
  return `${protocol}://${host}`;
}
