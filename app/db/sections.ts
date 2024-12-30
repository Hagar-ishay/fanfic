"use server";
import * as drizzle from "drizzle-orm";

import { db } from "@/db/db";
import { sectionFanfics, sections } from "@/db/schema";
import { DEFAULT_SECTIONS } from "@/consts";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NeonHttpQueryResultHKT } from "drizzle-orm/neon-http";

export const selectOrCreateSections = async (userId: string) => {
  let userSections = await listUserSections(userId);
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

export const listUserSections = async (userId: string) => {
  return await db
    .select()
    .from(sections)
    .where(drizzle.eq(sections.userId, userId));
};

export const insertSection = async ({
  name,
  displayName,
  userId,
  parentId,
}: {
  name: string;
  displayName: string;
  userId: string;
  parentId: number | null;
}) => {
  const result = await db
    .insert(sections)
    .values({ name, displayName, userId, parentId })
    .returning({ id: sections.id });
  expirePath(`/library/sections/${parentId}`);
  return result[0].id;
};

export const deleteSection = async (
  sectionId: number,
  tx: PgTransaction<
    NeonHttpQueryResultHKT,
    Record<string, never>,
    drizzle.ExtractTablesWithRelations<Record<string, never>>
  > | null = null
) => {
  const isTopLevel = !tx;
  const currentTx = tx || (await db.transaction(async (trx) => trx));

  const deleteFunc = async (
    innerTx: PgTransaction<
      NeonHttpQueryResultHKT,
      Record<string, never>,
      drizzle.ExtractTablesWithRelations<Record<string, never>>
    >
  ) => {
    const childSections = await innerTx
      .select()
      .from(sections)
      .where(drizzle.eq(sections.parentId, sectionId));

    await Promise.all(
      childSections.map((child) => deleteSection(child.id, innerTx))
    );

    await innerTx
      .delete(sectionFanfics)
      .where(drizzle.eq(sectionFanfics.sectionId, sectionId));
    await innerTx.delete(sections).where(drizzle.eq(sections.id, sectionId));
  };

  if (isTopLevel) {
    await db.transaction(async (newTx) => {
      await deleteFunc(newTx);
      expirePath(`/library/sections/${sectionId}`);
    });
  } else {
    if (currentTx) {
      await deleteFunc(currentTx);
    }
  }
};

export const transferSection = async (
  sectionId: number,
  parentId: number | null
) => {
  await db
    .update(sections)
    .set({ parentId })
    .where(drizzle.eq(sections.id, sectionId));
  expirePath(`/library/sections/${parentId}`);
};

export const getSectionByNameUser = async (userId: string, name: string) => {
  return await db
    .select()
    .from(sections)
    .where(
      drizzle.and(
        drizzle.eq(sections.userId, userId),
        drizzle.ilike(sections.name, name)
      )
    );
};

export const listChildSections = async (sectionId: number) => {
  return await db
    .select()
    .from(sections)
    .where(drizzle.eq(sections.parentId, sectionId));
};

export const getSection = async (sectionId: number) => {
  const section = await db
    .select()
    .from(sections)
    .where(drizzle.eq(sections.id, sectionId));
  return section ? section[0] : null;
};
