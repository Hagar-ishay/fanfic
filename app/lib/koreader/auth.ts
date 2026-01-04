"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { integrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

/**
 * Authenticate KOReader OPDS request
 * Supports both NextAuth session and API key authentication
 */
export async function authenticateOPDSRequest(
  request: NextRequest
): Promise<string | null> {
  // Try NextAuth session first
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  // Try API key authentication
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.substring(7);
    return await verifyApiKey(apiKey);
  }

  // Try Basic auth (for KOReader OPDS catalog)
  if (authHeader?.startsWith("Basic ")) {
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const password = credentials.split(":")[1];

    // Username is userId, password is API key
    const userId = await verifyApiKey(password);
    return userId;
  }

  return null;
}

/**
 * Verify API key and return user ID
 */
async function verifyApiKey(apiKey: string): Promise<string | null> {
  try {
    // Find all koreader_api integrations
    const apiIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.type, "koreader_api"),
          eq(integrations.isActive, true)
        )
      );

    // Check each integration's hashed API key
    for (const integration of apiIntegrations) {
      const config = integration.config as { apiKeyHash?: string };
      if (config.apiKeyHash) {
        const isValid = await bcrypt.compare(apiKey, config.apiKeyHash);
        if (isValid) {
          return integration.userId;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("API key verification error:", error);
    return null;
  }
}

/**
 * Generate a new API key for KOReader integration
 */
export async function generateKOReaderApiKey(
  userId: string
): Promise<string> {
  // Generate random API key (32 characters)
  const apiKey = Array.from({ length: 32 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 62)
    )
  ).join("");

  // Hash the API key
  const apiKeyHash = await bcrypt.hash(apiKey, 10);

  // Create or update integration
  const [existing] = await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.userId, userId), eq(integrations.type, "koreader_api"))
    )
    .limit(1);

  if (existing) {
    // Update existing
    await db
      .update(integrations)
      .set({
        config: { apiKeyHash },
        isActive: true,
      })
      .where(eq(integrations.id, existing.id));
  } else {
    // Create new
    await db.insert(integrations).values({
      userId,
      type: "koreader_api",
      name: "KOReader API",
      category: "koreader",
      config: { apiKeyHash },
      isActive: true,
    });
  }

  return apiKey;
}

/**
 * Get user's KOReader API key status
 */
export async function getKOReaderApiKeyStatus(
  userId: string
): Promise<boolean> {
  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.type, "koreader_api"),
        eq(integrations.isActive, true)
      )
    )
    .limit(1);

  return !!integration;
}
