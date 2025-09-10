"use server";
import * as drizzle from "drizzle-orm";

import { db } from "@/db/db";
import { fanfics, sectionFanfics, sections } from "@/db/schema";
import { NewFanfic, UserFanfic } from "@/db/types";
import { revalidatePath } from "next/cache";
import { getDetailedFanficIntegrations } from "@/db/fanficIntegrations";
import { cleanupFromCloud } from "@/lib/cloudSync";
import logger from "@/logger";
export const updateFanfic = async (ficId: number, { ...update }) => {
  return await db
    .update(fanfics)
    .set(update)
    .where(drizzle.eq(fanfics.id, ficId))
    .returning({ fanficId: fanfics.id });
};

export const tranferSectionFanfic = async (
  sectionFanficId: number,
  newSectionId: number,
  oldSectionId: number
) => {
  const position = await getNextPosition(newSectionId);
  const updateParams = { position, sectionId: newSectionId };
  
  // Check if the new section has cleanup enabled
  const newSection = await db
    .select()
    .from(sections)
    .where(drizzle.eq(sections.id, newSectionId));
  
  if (newSection[0]?.enableIntegrationCleanup) {
    // Get fanfic details and integrations for cleanup
    const fanficData = await getFanficById(sectionFanficId);
    if (fanficData) {
      const fanficIntegrations = await getDetailedFanficIntegrations(sectionFanficId);
      
      // Perform cleanup for each cloud integration
      for (const integration of fanficIntegrations) {
        if (['google_drive', 'webdav', 'dropbox'].includes(integration.integration.type)) {
          try {
            const cleanupResult = await cleanupFromCloud({
              fanficIntegration: integration,
              fanficTitle: fanficData.title,
            });
            
            if (cleanupResult.success) {
              logger.info(`Cleaned up ${fanficData.title} from ${integration.integration.name}: ${cleanupResult.message}`);
            } else {
              logger.warn(`Failed to cleanup ${fanficData.title} from ${integration.integration.name}: ${cleanupResult.message}`);
            }
          } catch (error) {
            logger.error(`Error during cleanup: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }
  }
  
  await db
    .update(sectionFanfics)
    .set(updateParams)
    .where(drizzle.eq(sectionFanfics.id, sectionFanficId));
  revalidatePath(`/library/sections/${oldSectionId}`);
};

export const updateSectionFanfic = async (
  sectionId: number,
  sectionFanficId: number,
  { ...update }
) => {
  await db
    .update(sectionFanfics)
    .set(update)
    .where(drizzle.eq(sectionFanfics.id, sectionFanficId));
  revalidatePath(`/library/sections/${sectionId}/fanfics/${sectionFanficId}`);
  revalidatePath(`/library/sections/${sectionId}`);
};

export const selectOngoingFanfics = async () => {
  return await db
    .select()
    .from(fanfics)
    .where(drizzle.isNull(fanfics.completedAt));
};

export const selectSectionFanfic = async (sectionIds: number[]) => {
  const result = await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .innerJoin(sections, drizzle.eq(sectionFanfics.sectionId, sections.id))
    .where(drizzle.inArray(sectionFanfics.sectionId, sectionIds))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
  return result.map((row) => ({
    ...row.fanfics,
    ...row.section_fanfics,
    id: row.section_fanfics.id,
    fanficId: row.fanfics.id,
    sectionName: row.sections.name,
    sectionParentId: row.sections.parentId,
  }));
};

export const listUserFanfics = async (
  userId: string
): Promise<UserFanfic[]> => {
  const result = await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .innerJoin(sections, drizzle.eq(sectionFanfics.sectionId, sections.id))
    .where(drizzle.eq(sectionFanfics.userId, userId))
    .orderBy(sectionFanfics.sectionId, sectionFanfics.position);
  return result.map((row) => ({
    ...row.fanfics,
    ...row.section_fanfics,
    id: row.section_fanfics.id,
    fanficId: row.fanfics.id,
    sectionName: row.sections.name,
    sectionParentId: row.sections.parentId,
  }));
};

export const getUserFanficExternalIds = async (
  userId: string
): Promise<Set<string>> => {
  const result = await db
    .select({ externalId: fanfics.externalId })
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .where(drizzle.eq(sectionFanfics.userId, userId));
  return new Set(result.map((row) => row.externalId.toString()));
};

export const getFanficById = async (sectionFanficId: number) => {
  const fanfic = await db
    .select()
    .from(fanfics)
    .innerJoin(sectionFanfics, drizzle.eq(fanfics.id, sectionFanfics.fanficId))
    .innerJoin(sections, drizzle.eq(sectionFanfics.sectionId, sections.id))
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
    sectionName: fanfic[0].sections.name,
    sectionParentId: fanfic[0].sections.parentId,
  };
};

export const getFanficByExternalId = async (externalId: number) => {
  const result = await db
    .select()
    .from(fanfics)
    .where(drizzle.eq(fanfics.externalId, externalId));
  if (result.length > 0) {
    return result[0];
  }
  return null;
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
  const position = await getNextPosition(sectionId);
  const result = await db
    .insert(sectionFanfics)
    .values({ sectionId, fanficId, position, userId })
    .returning({ fanficId: sectionFanfics.id });
  revalidatePath(`/library/sections/${sectionId}`);
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
  // Get fanfic details and integrations before deletion
  const fanficData = await getFanficById(userFanficId);
  if (fanficData) {
    const fanficIntegrations = await getDetailedFanficIntegrations(userFanficId);
    
    // Perform cleanup for each cloud integration
    for (const integration of fanficIntegrations) {
      if (['google_drive', 'webdav', 'dropbox'].includes(integration.integration.type)) {
        try {
          const cleanupResult = await cleanupFromCloud({
            fanficIntegration: integration,
            fanficTitle: fanficData.title,
          });
          
          if (cleanupResult.success) {
            logger.info(`Cleaned up ${fanficData.title} from ${integration.integration.name} during deletion: ${cleanupResult.message}`);
          } else {
            logger.warn(`Failed to cleanup ${fanficData.title} from ${integration.integration.name} during deletion: ${cleanupResult.message}`);
          }
        } catch (error) {
          logger.error(`Error during cleanup on deletion: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  const result = await db
    .delete(sectionFanfics)
    .where(drizzle.eq(sectionFanfics.id, userFanficId))
    .returning({
      fanficId: sectionFanfics.id,
      sectionId: sectionFanfics.sectionId,
    });
  if (result.length === 1) {
    revalidatePath(`/library/sections/${result[0].sectionId}`);
  }
};

export const reorderFanfics = async (
  sectionId: number,
  fromIndex: number,
  toIndex: number
) => {
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
        tx
          .update(sectionFanfics)
          .set({ position: -index })
          .where(drizzle.eq(sectionFanfics.id, fanfic.id))
      )
    );

    await tx
      .update(sectionFanfics)
      .set({ position: drizzle.sql`-position` })
      .where(drizzle.eq(sectionFanfics.sectionId, sectionId));

    return fanfics;
  });

  revalidatePath(`/library/sections/${sectionId}`);
  return result;
};
