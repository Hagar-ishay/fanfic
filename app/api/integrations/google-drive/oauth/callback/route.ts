import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createIntegration, updateIntegration } from "@/db/integrations";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/signin`);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      logger.error(`Google Drive OAuth error: ${error}`);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings?error=invalid_oauth_response`
      );
    }

    // Decode state to get integration details
    let integrationRequest;
    try {
      const decodedState = Buffer.from(state, "base64").toString("utf-8");
      integrationRequest = JSON.parse(decodedState);
    } catch (parseError) {
      logger.error(`Failed to parse OAuth state: ${errorMessage(parseError)}`);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings?error=invalid_state`
      );
    }

    // Verify user ID matches
    if (integrationRequest.userId !== session.user.id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings?error=user_mismatch`
      );
    }

    // Use the current request's origin instead of hardcoded NEXTAUTH_URL
    const origin = new URL(request.url).origin;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${origin}/api/integrations/google-drive/oauth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      logger.error(`Token exchange failed: ${errorData}`);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/settings?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Check if this is a re-authentication
    if (integrationRequest.isReauth && integrationRequest.existingIntegrationId) {
      // Update existing integration with new tokens
      await updateIntegration(integrationRequest.existingIntegrationId, {
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          folderId: integrationRequest.folderId,
          expiresAt: tokens.expires_in
            ? Math.floor(Date.now() / 1000 + tokens.expires_in).toString()
            : "",
        },
      });
    } else {
      // Create new integration
      await createIntegration({
        category: "cloud_storage",
        userId: session.user.id,
        name: integrationRequest.name,
        type: "google_drive",
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          folderId: integrationRequest.folderId,
          expiresAt: tokens.expires_in
            ? Math.floor(Date.now() / 1000 + tokens.expires_in).toString()
            : "",
        },
      });
    }

    logger.info(
      `Google Drive integration created successfully for user ${session.user.id}`
    );

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings?success=google_drive_connected`
    );
  } catch (error) {
    logger.error(`Google Drive OAuth callback error: ${errorMessage(error)}`);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/settings?error=integration_failed`
    );
  }
}
