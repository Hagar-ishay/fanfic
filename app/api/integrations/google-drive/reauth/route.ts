import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getIntegration } from "@/db/integrations";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { integrationId: number };
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    // Verify that the integration belongs to the user
    const integration = await getIntegration(integrationId);
    if (!integration || integration.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Integration not found or access denied" },
        { status: 404 }
      );
    }

    if (integration.type !== "google_drive") {
      return NextResponse.json(
        { error: "Invalid integration type" },
        { status: 400 }
      );
    }

    // Create OAuth URL for re-authentication
    const origin = new URL(request.url).origin;
    const state = JSON.stringify({
      userId: session.user.id,
      name: integration.name,
      folderId: integration.config.folderId || "root",
      isReauth: true,
      existingIntegrationId: integrationId,
    });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${origin}/api/integrations/google-drive/oauth/callback`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive",
      access_type: "offline",
      prompt: "consent", // Force consent to get new refresh token
      state: Buffer.from(state).toString("base64"),
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    logger.error(`Google Drive re-auth error: ${errorMessage(error)}`);
    return NextResponse.json(
      {
        error: "Failed to initiate Google Drive re-authentication",
      },
      { status: 500 }
    );
  }
}