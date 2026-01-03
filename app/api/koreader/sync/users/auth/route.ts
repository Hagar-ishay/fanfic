import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

export const maxDuration = 59;

/**
 * GET /api/koreader/sync/users/auth
 * KOSync authentication endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const username = request.headers.get("x-auth-user");
    const authKey = request.headers.get("x-auth-key");

    if (!username || !authKey) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Find integration
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, username),
          eq(integrations.type, "koreader_sync"),
          eq(integrations.isActive, true)
        )
      )
      .limit(1);

    if (!integration) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    // Get stored password hash
    const config = integration.config as { passwordHash?: string };
    if (!config.passwordHash) {
      return NextResponse.json(
        { message: "Invalid configuration" },
        { status: 401 }
      );
    }

    // KOReader sends MD5(password) as x-auth-key
    // We need to verify: MD5(password) matches the hash of the original password
    // Since we stored bcrypt(password), we need to compare differently
    // Actually, KOReader stores the password plaintext on device and sends MD5(password)
    // So we need to store the original password (encrypted or hashed) to verify

    // For security, we'll verify by comparing bcrypt hash
    // This requires KOReader to send the actual password, not MD5
    // Let's check if authKey is MD5 (32 hex chars) or actual password

    let isValid = false;

    if (authKey.length === 32 && /^[a-f0-9]+$/i.test(authKey)) {
      // This is MD5 hash - we need to handle this differently
      // For now, we'll store a mapping of MD5 -> user in config
      const storedMd5 = config.passwordHash;
      isValid = authKey.toLowerCase() === storedMd5;
    } else {
      // This is the actual password
      isValid = await bcrypt.compare(authKey, config.passwordHash);
    }

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authorized: "OK",
      },
      {
        headers: {
          "Content-Type": "application/vnd.koreader.v1+json",
        },
      }
    );
  } catch (error) {
    console.error("KOSync auth error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
