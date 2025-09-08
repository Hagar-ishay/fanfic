import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createIntegration } from "@/db/integrations";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Always require OAuth for Google Drive to ensure proper Drive permissions
    return NextResponse.json(
      {
        error:
          "Google Drive integration requires specific permissions. Please complete the OAuth flow.",
        requiresOAuth: true,
      },
      { status: 400 }
    );

    const body = (await request.json()) as { name?: string; folderId?: string };
    const { name, folderId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Integration name is required" },
        { status: 400 }
      );
    }

    const integration = await createIntegration({
      category: "cloud_storage",
      userId: session.user.id,
      name,
      type: "google_drive",
      config: {
        accessToken: session.accessToken,
        folderId: folderId || "root",
        refreshToken: session.refreshToken,
      },
    });

    return NextResponse.json({ success: true, integration });
  } catch (error) {
    logger.error(`Google Drive integration error: ${errorMessage(error)}`);
    return NextResponse.json(
      {
        error: "Failed to create Google Drive integration",
      },
      { status: 500 }
    );
  }
}
