import { db } from "@/db/db";
import { credentials } from "@/db/schema";
import { SessionType } from "@/db/types";
import * as drizzle from "drizzle-orm";

export const getCredentials = async (type: SessionType) => {
  const creds = await db
    .select()
    .from(credentials)
    .where(drizzle.eq(credentials.type, type));
  if (creds.length > 0) {
    return creds[0];
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
