"use server";
import * as drizzle from "drizzle-orm";

import { db } from "@/db/db";
import { fanfics, sectionFanfics } from "@/db/schema";
import { NewFanfic } from "@/db/types";

export const updateFanfic = async (ficId: number, { ...update }) => {
  return await db
    .update(fanfics)
    .set(update)
    .where(drizzle.eq(fanfics.id, ficId))
    .returning({ fanficId: fanfics.id });
};

export const updateSectionFanfic = async (
  sectionFanficId: number,
  { ...update }
) => {
  return await db
    .update(sectionFanfics)
    .set(update)
    .where(drizzle.eq(sectionFanfics.id, sectionFanficId));
};

export const selectOngoingFanfics = async () => {
  return await db
    .select()
    .from(fanfics)
    .where(drizzle.isNull(fanfics.completedAt));
};

export const selectSectionFanfic = async (sectionIds: number[]) => {
  return await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .where(drizzle.inArray(sectionFanfics.sectionId, sectionIds))
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
  };
};

export const insertFanfic = async (fanfic: NewFanfic) => {
  const result = await db
    .insert(fanfics)
    .values(fanfic)
    .returning({ fanficId: fanfics.id });
  return result[0].fanficId;
};

export const insertSectionFanfic = async (
  sectionId: number,
  userId: string,
  fanficId: number
) => {
  const highestPosition = await db
    .select({ maxPosition: drizzle.max(sectionFanfics.position) })
    .from(sectionFanfics)
    .where(drizzle.eq(sectionFanfics.sectionId, sectionId));
  const position =
    highestPosition.length > 0 && highestPosition[0].maxPosition !== null
      ? highestPosition[0].maxPosition + 1
      : 0;
  const result = await db
    .insert(sectionFanfics)
    .values({ sectionId, fanficId, position, userId })
    .returning({ fanficId: fanfics.id });
  return result[0].fanficId;
};

export const deleteSectionFanfic = async (userFanficId: number) => {
  return await db
    .delete(sectionFanfics)
    .where(drizzle.eq(sectionFanfics.id, userFanficId))
    .returning({ fanficId: fanfics.id });
};
