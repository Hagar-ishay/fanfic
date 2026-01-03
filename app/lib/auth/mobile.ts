"use server";

import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "30d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

interface TokenPayload {
  userId: string;
  type: "access" | "refresh";
}

/**
 * Generate a JWT access token for mobile authentication
 * @param userId - The user's ID
 * @returns JWT access token string
 */
export async function generateJWT(userId: string): Promise<string> {
  const payload: TokenPayload = {
    userId,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Generate a refresh token for mobile authentication
 * @param userId - The user's ID
 * @returns JWT refresh token string
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const payload: TokenPayload = {
    userId,
    type: "refresh",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify and extract user ID from JWT token in Authorization header
 * @param request - Next.js request object
 * @returns userId if token is valid, null otherwise
 */
export async function verifyMobileToken(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== "access") {
      return null;
    }

    return decoded.userId;
  } catch {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Exchange refresh token for new access token
 * @param refreshToken - The refresh token
 * @returns New access token if refresh token is valid, null otherwise
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;

    if (decoded.type !== "refresh") {
      return null;
    }

    return await generateJWT(decoded.userId);
  } catch {
    // Refresh token is invalid or expired
    return null;
  }
}
