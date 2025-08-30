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

async function refreshAccessToken(token: any) {
  try {
    console.log("Attempting to refresh access token");
    
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

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Token refresh failed:", refreshedTokens);
      throw refreshedTokens;
    }

    console.log("Token refresh successful");
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

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
          scope: "openid email profile https://www.googleapis.com/auth/drive.file",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
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
      console.log("JWT callback called", { hasUser: !!user, hasAccount: !!account, hasToken: !!token });
      
      if (user) {
        console.log("Setting user ID:", user.id);
        token.sub = user.id;
      }
      
      if (account) {
        console.log("Setting tokens from account", { 
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at 
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Return token immediately if this is a new login (account exists)
      if (account) {
        console.log("New login, returning token");
        return token;
      }
      
      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        console.log("Token still valid, returning existing token");
        return token;
      }

      // If we have a refresh token and the access token has expired, try to update it
      if (token.refreshToken && token.expiresAt && Date.now() >= (token.expiresAt as number) * 1000) {
        console.log("Token expired, attempting refresh");
        return refreshAccessToken(token);
      }

      console.log("Returning token as-is");
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
