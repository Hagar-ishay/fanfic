import { neon } from "@neondatabase/serverless";
import * as drizz from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { ENV } from "@/config";
import { fanfics, sections } from "./schema";
import type { NewFanfic } from "./types";

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

export const selectFanfics = async (sectionId: number) => {
  return await db
    .select()
    .from(fanfics)
    .where(drizz.eq(fanfics.sectionId, sectionId));
};

export const listFanfics = async () => {
  return await db.select().from(fanfics);
};

export const selectOngoingFanfics = async () => {
  return await db
    .select()
    .from(fanfics)
    .where(drizz.isNull(fanfics.completedAt));
};

export const selectSections = async () => {
  return await db.select().from(sections);
};

export const getSectionByName = async (name: string) => {
  return await db.select().from(sections).where(drizz.eq(sections.name, name));
};
