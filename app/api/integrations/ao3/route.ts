import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createIntegration } from "@/db/integrations";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";
import { AO3Client } from "@/lib/ao3Client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { 
      name?: string; 
      username?: string; 
      password?: string; 
    };
    const { name, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Integration name, username, and password are required" },
        { status: 400 }
      );
    }

    // Test AO3 credentials by attempting to login
    const ao3Client = new AO3Client();
    try {
      await ao3Client.testLogin(username, password);
    } catch (error) {
      logger.error(`AO3 credential validation failed: ${errorMessage(error)}`);
      return NextResponse.json(
        { error: "Invalid AO3 credentials. Please check your username and password." },
        { status: 400 }
      );
    }

    const integration = await createIntegration({
      category: "authentication",
      userId: session.user.id,
      name,
      type: "ao3",
      config: {
        username,
        password, // Note: This will be encrypted by the integration system
      },
    });

    return NextResponse.json({ success: true, integration });
  } catch (error) {
    logger.error(`AO3 integration error: ${errorMessage(error)}`);
    return NextResponse.json(
      {
        error: "Failed to create AO3 integration",
      },
      { status: 500 }
    );
  }
}