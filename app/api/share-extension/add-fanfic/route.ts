import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";
import { getSettings } from "@/db/settings";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      url?: string;
      sectionId?: number;
    };
    const { url, sectionId } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Resolve section ID - use provided or fall back to default
    let targetSectionId: number;

    if (sectionId) {
      targetSectionId = sectionId;
    } else {
      const settings = await getSettings(session.user.id);

      if (!settings.defaultSectionId) {
        return NextResponse.json(
          { error: "No section specified and no default section configured" },
          { status: 400 }
        );
      }

      targetSectionId = settings.defaultSectionId;
    }

    // Call the existing server action to add the fanfic
    const result = await addFanfic(targetSectionId, session.user.id, url);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fanfic added successfully",
    });
  } catch (error) {
    logger.error(`Share extension add fanfic error: ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Failed to add fanfic" },
      { status: 500 }
    );
  }
}
