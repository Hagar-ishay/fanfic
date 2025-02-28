"use server";
import * as drizzle from "drizzle-orm";

import { db } from "@/db/db";
import { fanfics, sectionFanfics, sections } from "@/db/schema";
import { NewFanfic } from "@/db/types";
import { expirePath } from "next/cache";

export const updateFanfic = async (ficId: number, { ...update }) => {
  return await db.update(fanfics).set(update).where(drizzle.eq(fanfics.id, ficId)).returning({ fanficId: fanfics.id });
};

export const tranferSectionFanfic = async (sectionFanficId: number, newSectionId: number, oldSectionId: number) => {
  const position = await getNextPosition(newSectionId);
  const updateParams = { position, sectionId: newSectionId };
  await db.update(sectionFanfics).set(updateParams).where(drizzle.eq(sectionFanfics.id, sectionFanficId));
  expirePath(`/library/sections/${oldSectionId}`);
};

export const updateSectionFanfic = async (sectionId: number, sectionFanficId: number, { ...update }) => {
  await db.update(sectionFanfics).set(update).where(drizzle.eq(sectionFanfics.id, sectionFanficId));
  expirePath(`/library/sections/${sectionId}/fanfics/${sectionFanficId}`);
};

export const selectOngoingFanfics = async () => {
  return await db.select().from(fanfics).where(drizzle.isNull(fanfics.completedAt));
};

export const selectSectionFanfic = async (sectionIds: number[]) => {
  return await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .where(drizzle.inArray(sectionFanfics.sectionId, sectionIds))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
};

export const listUserFanfics = async (userId: string) => {
  return await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .innerJoin(sections, drizzle.eq(sectionFanfics.sectionId, sections.id))
    .where(drizzle.eq(sectionFanfics.userId, userId))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
};

export const getFanficById = async (sectionFanficId: number) => {
  const fanfic = await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .where(drizzle.eq(sectionFanfics.id, sectionFanficId))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
  if (fanfic.length === 0) {
    return null;
  }
  return {
    ...fanfic[0].fanfics,
    ...fanfic[0].section_fanfics,
    id: fanfic[0].section_fanfics.id,
    fanficId: fanfic[0].fanfics.id,
  };
};

export const getFanficByExternalId = async (externalId: number) => {
  const result = await db.select().from(fanfics).where(drizzle.eq(fanfics.externalId, externalId));
  if (result.length > 0) {
    return result[0];
  }
  return null;
};

export const insertFanfic = async (fanfic: NewFanfic) => {
  const result = await db.insert(fanfics).values(fanfic).returning({ fanficId: fanfics.id });
  return result[0].fanficId;
};

export const insertSectionFanfic = async (sectionId: number, userId: string, fanficId: number) => {
  const position = await getNextPosition(sectionId);
  const result = await db
    .insert(sectionFanfics)
    .values({ sectionId, fanficId, position, userId })
    .returning({ fanficId: sectionFanfics.id });
  expirePath(`/library/sections/${sectionId}`);
  return result[0].fanficId;
};

export const getNextPosition = async (sectionId: number) => {
  const highestPosition = await db
    .select({ maxPosition: drizzle.max(sectionFanfics.position) })
    .from(sectionFanfics)
    .where(drizzle.eq(sectionFanfics.sectionId, sectionId));
  if (highestPosition.length === 0 || highestPosition[0].maxPosition === null) {
    return 0;
  }
  return highestPosition[0].maxPosition + 1;
};

export const deleteSectionFanfic = async (userFanficId: number) => {
  const result = await db.delete(sectionFanfics).where(drizzle.eq(sectionFanfics.id, userFanficId)).returning({
    fanficId: sectionFanfics.id,
    sectionId: sectionFanfics.sectionId,
  });
  if (result.length === 1) {
    expirePath(`/library/sections/${result[0].sectionId}`);
  }
};

export const reorderFanfics = async (sectionId: number, fromIndex: number, toIndex: number) => {
  const result = await db.transaction(async (tx) => {
    const fanfics = await tx
      .select()
      .from(sectionFanfics)
      .where(drizzle.eq(sectionFanfics.sectionId, sectionId))
      .orderBy(sectionFanfics.position);

    const [movedFanfic] = fanfics.splice(fromIndex, 1);
    fanfics.splice(toIndex, 0, movedFanfic);

    await Promise.all(
      fanfics.map((fanfic, index) =>
        tx.update(sectionFanfics).set({ position: -index }).where(drizzle.eq(sectionFanfics.id, fanfic.id))
      )
    );

    await tx
      .update(sectionFanfics)
      .set({ position: drizzle.sql`-position` })
      .where(drizzle.eq(sectionFanfics.sectionId, sectionId));

    return fanfics;
  });

  expirePath(`/library/sections/${sectionId}`);
  return result;
};
