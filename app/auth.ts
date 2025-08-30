import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/db";
import GoogleProvider from "next-auth/providers/google";
import {
  accounts,
  users,
  authenticators,
  sessions,
  verificationTokens,
} from "@/db/schema";
import logger from "@/logger";

interface TokenWithRefresh {
  refreshToken?: string;
  expiresAt?: number;
  accessToken?: string;
  [key: string]: unknown;
}

async function refreshAccessToken(token: TokenWithRefresh) {
  try {
    logger.info("Attempting to refresh access token");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    };

    if (!response.ok) {
      logger.error("Token refresh failed:", refreshedTokens);
      throw new Error(refreshedTokens.error || "Token refresh failed");
    }

    logger.info("Token refresh successful");
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: refreshedTokens.expires_in
        ? Math.floor(Date.now() / 1000 + refreshedTokens.expires_in)
        : token.expiresAt,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    logger.error("Error refreshing access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, auth } = NextAuth({
  debug: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      logger.info("JWT callback called", {
        hasUser: !!user,
        hasAccount: !!account,
        hasToken: !!token,
      });

      if (user) {
        logger.info("Setting user ID:", user.id);
        token.sub = user.id;
      }

      if (account) {
        logger.info("Setting tokens from account", {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Return token immediately if this is a new login (account exists)
      if (account) {
        logger.info("New login, returning token");
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        logger.info("Token still valid, returning existing token");
        return token;
      }

      // If we have a refresh token and the access token has expired, try to update it
      if (
        token.refreshToken &&
        token.expiresAt &&
        Date.now() >= (token.expiresAt as number) * 1000
      ) {
        logger.info("Token expired, attempting refresh");
        return refreshAccessToken(token);
      }

      logger.info("Returning token as-is");
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
});

export { handlers as GET, handlers as POST };
