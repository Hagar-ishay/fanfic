import { neon } from "@neondatabase/serverless";
import * as drizz from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { ENV } from "@/config";
import { fanfics, sections, sectionFanfics, credentials } from "./schema";
import type { NewFanfic, SessionType } from "./types";
import { DEFAULT_SECTIONS } from "@/consts";

if (!ENV.DATABASE_URL) {
  throw "Database URL string Was not set!";
}

const sql = neon(ENV.DATABASE_URL);
export const db = drizzle({ client: sql });

export const insertFanfic = async (fanfic: NewFanfic) => {
  return db.insert(fanfics).values(fanfic);
};

export const deleteFanfic = async (ficId: number) => {
  return await db
    .delete(fanfics)
    .where(drizz.eq(fanfics.id, ficId))
    .returning({ fanficId: fanfics.id });
};

export const updateFanfic = async (ficId: number, { ...update }) => {
  return await db
    .update(fanfics)
    .set(update)
    .where(drizz.eq(fanfics.id, ficId))
    .returning({ fanficId: fanfics.id });
};

export const selectOngoingFanfics = async () => {
  return await db
    .select()
    .from(fanfics)
    .where(drizz.isNull(fanfics.completedAt));
};

export const selectOrCreateSections = async (userId: string) => {
  let userSections = await db
    .select()
    .from(sections)
    .where(drizz.eq(sections.userId, userId));
  if (userSections.length === 0) {
    userSections = await db
      .insert(sections)
      .values(DEFAULT_SECTIONS.map((section) => ({ ...section, userId })))
      .returning({
        id: sections.id,
        name: sections.name,
        userId: sections.userId,
        parentId: sections.parentId,
        displayName: sections.displayName,
        updateTime: sections.updateTime,
        creationTime: sections.creationTime,
      });
  }
  return userSections;
};

export const selectSectionFanfic = async (sectionIds: number[]) => {
  return await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizz.eq(fanfics.id, sectionFanfics.fanficId))
    .where(drizz.inArray(sectionFanfics.sectionId, sectionIds))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
};

export const getCredentials = async (type: SessionType) => {
  const creds = await db
    .select()
    .from(credentials)
    .where(drizz.eq(credentials.type, type));
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
      targetWhere: drizz.eq(credentials.type, type),
      set: data,
    });
};
