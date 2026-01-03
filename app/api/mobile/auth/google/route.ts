import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/db/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateJWT, generateRefreshToken } from "@/lib/auth/mobile";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;

    if (user.length === 0) {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          email,
          name: name || null,
          image: picture || null,
          emailVerified: new Date(),
        })
        .returning();

      userId = newUser[0].id;

      // Create account record for Google provider
      await db.insert(accounts).values({
        userId,
        type: "oauth",
        provider: "google",
        providerAccountId: googleId,
        access_token: null,
        refresh_token: null,
        expires_at: null,
        token_type: "Bearer",
        scope: "openid email profile",
        id_token: idToken,
        session_state: null,
      });
    } else {
      userId = user[0].id;

      // Check if Google account is already linked
      const existingAccount = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId))
        .limit(1);

      if (existingAccount.length === 0) {
        // Link Google account
        await db.insert(accounts).values({
          userId,
          type: "oauth",
          provider: "google",
          providerAccountId: googleId,
          access_token: null,
          refresh_token: null,
          expires_at: null,
          token_type: "Bearer",
          scope: "openid email profile",
          id_token: idToken,
          session_state: null,
        });
      }
    }

    // Generate JWT tokens
    const accessToken = await generateJWT(userId);
    const refreshToken = await generateRefreshToken(userId);

    // Get updated user data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userData[0].id,
          email: userData[0].email,
          name: userData[0].name,
          image: userData[0].image,
        },
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
