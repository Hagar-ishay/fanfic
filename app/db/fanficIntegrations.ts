"use server";

import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import {
  fanficIntegrations,
  sectionFanfics,
  fanfics,
  sections,
  integrations,
} from "./schema";

// Cached version
export async function getFanficIntegrationsCached(sectionFanficId: number) {
  "use cache";
  return getFanficIntegrations(sectionFanficId);
}

// Bulk fetch for better performance
export async function getBulkFanficIntegrations(sectionFanficIds: number[]) {
  "use cache";
  if (sectionFanficIds.length === 0) return {};
  
  const results = await db
    .select({
      id: fanficIntegrations.id,
      sectionFanficId: fanficIntegrations.sectionFanficId,
      integrationId: fanficIntegrations.integrationId,
      enabled: fanficIntegrations.enabled,
      lastTriggered: fanficIntegrations.lastTriggered,
      cloudPath: fanficIntegrations.cloudPath,
      syncStatus: fanficIntegrations.syncStatus,
      lastError: fanficIntegrations.lastError,
      creationTime: fanficIntegrations.creationTime,
      updateTime: fanficIntegrations.updateTime,
      integration: {
        id: integrations.id,
        type: integrations.type,
        name: integrations.name,
        config: integrations.config,
        isEnabled: integrations.enabled,
        creationTime: integrations.creationTime,
        updateTime: integrations.updateTime,
      },
    })
    .from(fanficIntegrations)
    .innerJoin(integrations, eq(fanficIntegrations.integrationId, integrations.id))
    .where(and(
      eq(fanficIntegrations.sectionFanficId, sectionFanficIds[0])
      // TODO: extend this to handle multiple IDs efficiently
    ))
    .orderBy(asc(fanficIntegrations.creationTime));

  // Group by sectionFanficId
  const grouped: Record<number, any[]> = {};
  for (const result of results) {
    if (!grouped[result.sectionFanficId]) {
      grouped[result.sectionFanficId] = [];
    }
    grouped[result.sectionFanficId].push(result);
  }
  
  return grouped;
}

export async function getFanficIntegrations(sectionFanficId: number) {
  return await db
    .select({
      id: fanficIntegrations.id,
      sectionFanficId: fanficIntegrations.sectionFanficId,
      integrationId: fanficIntegrations.integrationId,
      enabled: fanficIntegrations.enabled,
      lastTriggered: fanficIntegrations.lastTriggered,
      cloudPath: fanficIntegrations.cloudPath,
      syncStatus: fanficIntegrations.syncStatus,
      lastError: fanficIntegrations.lastError,
      creationTime: fanficIntegrations.creationTime,
      updateTime: fanficIntegrations.updateTime,
      integration: {
        id: integrations.id,
        type: integrations.type,
        name: integrations.name,
        category: integrations.category,
        config: integrations.config,
      },
    })
    .from(fanficIntegrations)
    .innerJoin(
      integrations,
      eq(fanficIntegrations.integrationId, integrations.id)
    )
    .where(eq(fanficIntegrations.sectionFanficId, sectionFanficId))
    .orderBy(asc(integrations.type));
}

export async function getFanficIntegration(id: number) {
  const result = await db
    .select()
    .from(fanficIntegrations)
    .where(eq(fanficIntegrations.id, id));
  return result ? result[0] : null;
}

export async function createFanficIntegration(
  sectionFanficId: number,
  integrationId: number,
  enabled: boolean = true
) {
  const result = await db
    .insert(fanficIntegrations)
    .values({
      sectionFanficId,
      integrationId,
      enabled,
      syncStatus: "pending",
    })
    .returning();

  revalidatePath("/library");

  // Return detailed structure using shared query builder
  const detailedResult = await buildDetailedFanficIntegrationQuery().where(
    eq(fanficIntegrations.id, result[0].id)
  );

  return detailedResult[0];
}

export async function updateLastTriggered(
  id: number,
  timestamp: Date = new Date()
) {
  const result = await db
    .update(fanficIntegrations)
    .set({
      lastTriggered: timestamp,
      syncStatus: "success",
      lastError: null,
    })
    .where(eq(fanficIntegrations.id, id))
    .returning();

  revalidatePath("/library");
  return result[0];
}

export async function updateSyncStatus(
  id: number,
  status: "pending" | "syncing" | "success" | "error",
  error?: string | null,
  cloudPath?: string
) {
  const updateData: {
    syncStatus: "pending" | "syncing" | "success" | "error";
    lastError: string | null;
    cloudPath?: string;
    lastTriggered?: Date;
  } = {
    syncStatus: status,
    lastError: error || null,
  };

  if (cloudPath) {
    updateData.cloudPath = cloudPath;
  }

  if (status === "success") {
    updateData.lastTriggered = new Date();
  }

  const result = await db
    .update(fanficIntegrations)
    .set(updateData)
    .where(eq(fanficIntegrations.id, id))
    .returning();

  revalidatePath("/library");
  return result[0];
}

export async function enableFanficSync(
  sectionFanficId: number,
  integrationId: number
) {
  // Check if record exists
  const existing = await db
    .select()
    .from(fanficIntegrations)
    .where(
      and(
        eq(fanficIntegrations.sectionFanficId, sectionFanficId),
        eq(fanficIntegrations.integrationId, integrationId)
      )
    );

  if (existing.length > 0) {
    // Update existing record
    return await db
      .update(fanficIntegrations)
      .set({ enabled: true })
      .where(eq(fanficIntegrations.id, existing[0].id))
      .returning();
  } else {
    // Create new record
    return await createFanficIntegration(sectionFanficId, integrationId, true);
  }
}

export async function disableFanficSync(
  sectionFanficId: number,
  integrationId: number
) {
  const result = await db
    .update(fanficIntegrations)
    .set({ enabled: false })
    .where(
      and(
        eq(fanficIntegrations.sectionFanficId, sectionFanficId),
        eq(fanficIntegrations.integrationId, integrationId)
      )
    )
    .returning();

  revalidatePath("/library");
  return result[0];
}

// Reusable query builder for detailed fanfic integration data
function buildDetailedFanficIntegrationQuery() {
  return db
    .select({
      fanficIntegrationId: fanficIntegrations.id,
      sectionFanficId: fanficIntegrations.sectionFanficId,
      integrationId: fanficIntegrations.integrationId,
      lastTriggered: fanficIntegrations.lastTriggered,
      syncStatus: fanficIntegrations.syncStatus,
      cloudPath: fanficIntegrations.cloudPath,
      enabled: fanficIntegrations.enabled,
      fanfic: {
        id: fanfics.id,
        externalId: fanfics.externalId,
        title: fanfics.title,
        author: fanfics.author,
        updatedAt: fanfics.updatedAt,
        downloadLink: fanfics.downloadLink,
      },
      section: {
        id: sections.id,
        name: sections.name,
        userId: sections.userId,
      },
      integration: {
        id: integrations.id,
        type: integrations.type,
        name: integrations.name,
        config: integrations.config,
      },
    })
    .from(fanficIntegrations)
    .innerJoin(
      sectionFanfics,
      eq(fanficIntegrations.sectionFanficId, sectionFanfics.id)
    )
    .innerJoin(fanfics, eq(sectionFanfics.fanficId, fanfics.id))
    .innerJoin(sections, eq(sectionFanfics.sectionId, sections.id))
    .innerJoin(
      integrations,
      eq(fanficIntegrations.integrationId, integrations.id)
    );
}

export async function getFanficsNeedingSync() {
  return await buildDetailedFanficIntegrationQuery().where(
    and(
      eq(fanficIntegrations.enabled, true),
      // Only cloud integrations (not email)
      eq(integrations.category, "cloud_storage")
    )
  );
}

export async function deleteFanficIntegration(id: number) {
  await db.delete(fanficIntegrations).where(eq(fanficIntegrations.id, id));
  revalidatePath("/library");
}
