import { db } from "@/db/db";
import { credentials } from "@/db/schema";
import { SessionType } from "@/db/types";
import * as drizzle from "drizzle-orm";

export const getCredentials = async (type: SessionType) => {
  "use cache"
  const creds = await db.select().from(credentials).where(drizzle.eq(credentials.type, type));
  if (creds.length > 0) {
    const cred = creds[0];
    if (cred.session && cred.session.length > 0) {
      const isExpired = cred.session.some((session) => {
        if (session.expires && session.expires < new Date()) {
          return true;
        }
        return false;
      });
      if (isExpired) {
        return null;
      }
    }
    return cred;
  }
  return null;
};

export const refreshSession = async (
  type: SessionType,
  newSession: {
    key: string;
    value: string;
    expires: Date | null | "Infinity";
  }[]
) => {
  const data = { session: newSession };
  return db
    .insert(credentials)
    .values({ ...data, type })
    .onConflictDoUpdate({
      target: credentials.type,
      targetWhere: drizzle.eq(credentials.type, type),
      set: data,
    });
};
