import { neon } from "@neondatabase/serverless";
import * as drizz from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { ENV } from "@/config";
import { fanfics, sections, credentials, sectionFanfics } from "./schema";
import type { NewFanfic, SectionFanfic, SessionType } from "./types";

if (!ENV.DATABASE_URL) {
  throw "Database URL string Was not set!";
}

const sql = neon(ENV.DATABASE_URL);
export const db = drizzle({ client: sql });

export const insertFanfic = async (fanfic: NewFanfic) => {
  const result = await db
    .insert(fanfics)
    .values(fanfic)
    .returning({ fanficId: fanfics.id });
  return result[0].fanficId;
};

export const insertSectionFanfic = async (
  fanficId: number,
  sectionId: number
) => {
  return await db.transaction(async (trx) => {
    {
      const result = await trx
        .select({ max: drizz.max(sectionFanfics.position) })
        .from(sectionFanfics)
        .where(drizz.eq(sections.id, sectionId));
      const position = result[0].max ?? 0;
      trx.insert(sectionFanfics).values({ fanficId, sectionId, position });
    }
  });
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

export const updateSectionFanfics = async (
  toUpdate: {
    sectionId: number;
    sectionFanficId: number;
    position: number;
  }[]
) => {
  return await db.transaction(async (trx) => {
    toUpdate.map((update) => {
      const data = { sectionId: update.sectionId, position: update.position };
      trx
        .update(sectionFanfics)
        .set(data)
        .where(drizz.eq(sectionFanfics.id, update.sectionFanficId));
    });
  });
};

export const listUserSections = async (userId: string) => {
  return await db
    .select()
    .from(sectionFanfics)
    .innerJoin(sections, drizz.eq(sectionFanfics.sectionId, sections.id))
    .innerJoin(fanfics, drizz.eq(sectionFanfics.fanficId, fanfics.id))
    .where(drizz.eq(sections.userId, userId));
};

export const selectOngoingFanfics = async () => {
  return await db
    .select()
    .from(fanfics)
    .where(drizz.isNull(fanfics.completedAt));
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
