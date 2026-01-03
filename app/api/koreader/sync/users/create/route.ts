import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const maxDuration = 59;

/**
 * POST /api/koreader/sync/users/create
 * KOSync user registration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if username (userId) already has a KOSync integration
    const [existing] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, username),
          eq(integrations.type, "koreader_sync")
        )
      )
      .limit(1);

    if (existing) {
      // Update password
      const passwordHash = await bcrypt.hash(password, 10);
      await db
        .update(integrations)
        .set({
          config: { passwordHash },
          isActive: true,
        })
        .where(eq(integrations.id, existing.id));

      return NextResponse.json(
        {
          username,
          registered: true,
        },
        {
          headers: {
            "Content-Type": "application/vnd.koreader.v1+json",
          },
        }
      );
    }

    // Create new integration
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(integrations).values({
      userId: username,
      type: "koreader_sync",
      name: "KOReader Sync",
      category: "koreader",
      config: { passwordHash },
      isActive: true,
    });

    return NextResponse.json(
      {
        username,
        registered: true,
      },
      {
        headers: {
          "Content-Type": "application/vnd.koreader.v1+json",
        },
      }
    );
  } catch (error) {
    console.error("KOSync registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
