"use server";

import * as drizzle from "drizzle-orm";

import { DEFAULT_SECTIONS } from "@/consts";
import { db } from "@/db/db";
import { sectionFanfics, sections } from "@/db/schema";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgTransaction } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";

export const selectOrCreateSections = async (userId: string) => {
  "use cache";
  let userSections = await listUserSections(userId);
  if (userSections.length === 0) {
    userSections = await db
      .insert(sections)
      .values(DEFAULT_SECTIONS.map((name) => ({ name, userId })))
      .returning();
  }
  return userSections;
};

export const listUserSections = async (userId: string) => {
  "use cache";
  return await db.select().from(sections).where(drizzle.eq(sections.userId, userId));
};

export const insertSection = async ({
  name,
  userId,
  parentId,
}: {
  name: string;
  userId: string;
  parentId: number | null;
}) => {
  const result = await db.insert(sections).values({ name, userId, parentId }).returning({ id: sections.id });
  parentId ? revalidatePath(`/library/sections/${parentId}`) : revalidatePath("/library");
  return result[0].id;
};

export const deleteSection = async (
  sectionId: number,
  tx: PgTransaction<
    NeonQueryResultHKT,
    Record<string, never>,
    drizzle.ExtractTablesWithRelations<Record<string, never>>
  > | null = null
) => {
  const isTopLevel = !tx;
  const currentTx = tx;

  const deleteFunc = async (
    innerTx: PgTransaction<
      NeonQueryResultHKT,
      Record<string, never>,
      drizzle.ExtractTablesWithRelations<Record<string, never>>
    >
  ) => {
    const childSections = await innerTx.select().from(sections).where(drizzle.eq(sections.parentId, sectionId));

    await Promise.all(childSections.map((child) => deleteSection(child.id, innerTx)));

    await innerTx.delete(sectionFanfics).where(drizzle.eq(sectionFanfics.sectionId, sectionId));
    await innerTx.delete(sections).where(drizzle.eq(sections.id, sectionId));
  };

  if (isTopLevel) {
    await db.transaction(async (newTx) => {
      await deleteFunc(newTx);
      revalidatePath(`/library/sections/${sectionId}`);
    });
  } else {
    if (currentTx) {
      await deleteFunc(currentTx);
    }
  }
};

export const transferSection = async (sectionId: number, parentId: number | null) => {
  await db.update(sections).set({ parentId }).where(drizzle.eq(sections.id, sectionId));
  revalidatePath(`/library/sections/${parentId}`);
};

export const getSectionByNameUser = async (userId: string, name: string) => {
  "use cache";
  return await db
    .select()
    .from(sections)
    .where(drizzle.and(drizzle.eq(sections.userId, userId), drizzle.ilike(sections.name, name)));
};

export const listChildSections = async (sectionId: number) => {
  "use cache";
  return await db.select().from(sections).where(drizzle.eq(sections.parentId, sectionId));
};

export const getSection = async (sectionId: number) => {
  "use cache";
  const section = await db.select().from(sections).where(drizzle.eq(sections.id, sectionId));
  return section ? section[0] : null;
};

export async function getBreadcrumbs(sectionId: number, displayName: string, parentId: number | null) {
  "use cache";
  let breadcrumbs = [
    {
      label: displayName,
      href: `/library/sections/${sectionId}`,
    },
  ];
  if (parentId) {
    const parentSection = await getSection(parentId);
    if (parentSection) {
      const parentBreadcrumbs = await getBreadcrumbs(parentSection.id, parentSection.name, parentSection.parentId);
      breadcrumbs = [...parentBreadcrumbs, ...breadcrumbs];
    }
  }
  return breadcrumbs;
}
