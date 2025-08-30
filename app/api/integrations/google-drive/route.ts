import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createIntegration } from "@/db/integrations";
import logger from "@/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Google Drive access token from OAuth
    if (!session.accessToken) {
      return NextResponse.json(
        {
          error:
            "No Google Drive access. Please sign out and sign in again to grant Google Drive permissions.",
        },
        { status: 400 }
      );
    }

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
        refreshToken: session.refreshToken,
        folderId: folderId || "root",
      },
    });

    return NextResponse.json({ success: true, integration });
  } catch (error) {
    logger.error("Google Drive integration error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Google Drive integration",
      },
      { status: 500 }
    );
  }
}
