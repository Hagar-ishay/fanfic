import { NextResponse } from "next/server";
import { auth } from "@/auth";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function POST() {
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
