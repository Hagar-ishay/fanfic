import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile";
import { getSection } from "@/db/sections";
import { selectSectionFanfic } from "@/db/fanfics";
import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyMobileToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sectionId = parseInt(id);

    if (isNaN(sectionId)) {
      return NextResponse.json(
        { error: "Invalid section ID" },
        { status: 400 }
      );
    }

    const section = await getSection(sectionId);

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    if (section.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const fanfics = await selectSectionFanfic([sectionId]);

    return NextResponse.json({
      data: fanfics,
    });
  } catch (error) {
    console.error("Get fanfics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fanfics" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyMobileToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sectionId = parseInt(id);

    if (isNaN(sectionId)) {
      return NextResponse.json(
        { error: "Invalid section ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fanficUrl } = body;

    if (!fanficUrl || typeof fanficUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid fanficUrl" },
        { status: 400 }
      );
    }

    const section = await getSection(sectionId);

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    if (section.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Use the existing server action to add fanfic
    const result = await addFanfic(sectionId, userId, fanficUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to add fanfic" },
        { status: 400 }
      );
    }

    // Get updated fanfic list for this section
    const fanfics = await selectSectionFanfic([sectionId]);

    return NextResponse.json({
      data: {
        success: true,
        fanfics,
      },
    });
  } catch (error) {
    console.error("Add fanfic error:", error);
    return NextResponse.json(
      { error: "Failed to add fanfic" },
      { status: 500 }
    );
  }
}
