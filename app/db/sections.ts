"use server";
import * as drizzle from "drizzle-orm";

import { db } from "@/db/db";
import { sections } from "@/db/schema";
import { DEFAULT_SECTIONS } from "@/consts";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";

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
