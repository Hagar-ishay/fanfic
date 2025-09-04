import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createIntegration } from "@/db/integrations";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

// Initiate Google Drive OAuth flow
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Google Drive";
    const folderId = searchParams.get("folderId") || "root";

    // Store the integration request in session/state for callback
    const state = JSON.stringify({
      userId: session.user.id,
      name,
      folderId,
    });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/oauth/callback`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive",
      access_type: "offline",
      prompt: "consent",
      state: Buffer.from(state).toString("base64"),
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    logger.error(`Google Drive OAuth initiation error: ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Failed to initiate Google Drive OAuth" },
      { status: 500 }
    );
  }
}