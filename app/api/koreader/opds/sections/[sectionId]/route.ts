import { NextRequest, NextResponse } from "next/server";
import { authenticateOPDSRequest } from "@/lib/koreader/auth";
import {
  generateOPDSCatalog,
  createSelfLink,
  createStartLink,
  createUpLink,
  createAcquisitionLink,
  type OPDSEntry,
} from "@/lib/koreader/opdsGenerator";
import { db } from "@/db/db";
import { sections, sectionFanfics, fanfics } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const maxDuration = 59;

/**
 * GET /api/koreader/opds/sections/[sectionId]
 * Section feed - lists fanfics within a section
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
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

  const { sectionId } = await params;
  const sectionIdNum = parseInt(sectionId);

  if (isNaN(sectionIdNum)) {
    return new NextResponse("Invalid section ID", { status: 400 });
  }

  try {
    // Verify user owns this section
    const [section] = await db
      .select()
      .from(sections)
      .where(and(eq(sections.id, sectionIdNum), eq(sections.userId, userId)))
      .limit(1);

    if (!section) {
      return new NextResponse("Section not found", { status: 404 });
    }

    // Get fanfics in this section
    const sectionFanficsList = await db
      .select({
        fanficId: sectionFanfics.fanficId,
        position: sectionFanfics.position,
        editableLabels: sectionFanfics.editableLabels,
        title: fanfics.title,
        author: fanfics.author,
        summary: fanfics.summary,
        updatedAt: fanfics.updatedAt,
        tags: fanfics.tags,
        chapterCount: fanfics.chapterCount,
        wordCount: fanfics.wordCount,
      })
      .from(sectionFanfics)
      .innerJoin(fanfics, eq(sectionFanfics.fanficId, fanfics.id))
      .where(
        and(
          eq(sectionFanfics.sectionId, sectionIdNum),
          eq(sectionFanfics.userId, userId)
        )
      )
      .orderBy(sectionFanfics.position);

    // Build OPDS feed
    const baseUrl = getBaseUrl(request);
    const catalogUrl = `${baseUrl}/api/koreader/opds/catalog`;
    const sectionUrl = `${baseUrl}/api/koreader/opds/sections/${sectionId}`;

    const entries: OPDSEntry[] = sectionFanficsList.map((item) => {
      const categories: string[] = [];

      // Add user labels
      if (item.editableLabels && Array.isArray(item.editableLabels)) {
        categories.push(...item.editableLabels);
      }

      // Add AO3 tags (limit to avoid bloat)
      if (item.tags && typeof item.tags === "object") {
        const allTags = Object.values(item.tags as Record<string, string[]>)
          .flat()
          .slice(0, 10); // Limit to 10 tags
        categories.push(...allTags);
      }

      return {
        id: `urn:fanfic:${item.fanficId}`,
        title: item.title,
        updated: item.updatedAt || new Date(),
        author: item.author || undefined,
        summary: item.summary
          ? truncateSummary(item.summary, 500)
          : undefined,
        categories: categories.length > 0 ? categories : undefined,
        links: [
          createAcquisitionLink(
            `${baseUrl}/api/koreader/opds/download/${item.fanficId}`
          ),
        ],
      };
    });

    const feed = {
      id: `urn:section:${sectionId}`,
      title: section.name,
      updated: new Date(),
      links: [
        createSelfLink(sectionUrl),
        createStartLink(catalogUrl),
        createUpLink(catalogUrl),
      ],
      entries,
    };

    const xml = generateOPDSCatalog(feed);

    return new NextResponse(xml, {
      headers: {
        "Content-Type":
          "application/atom+xml;profile=opds-catalog;kind=acquisition",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error generating section feed:", error);
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

/**
 * Truncate summary to a maximum length
 */
function truncateSummary(summary: string, maxLength: number): string {
  if (summary.length <= maxLength) {
    return summary;
  }
  return summary.substring(0, maxLength - 3) + "...";
}
