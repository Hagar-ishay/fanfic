"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { integrations, fanficIntegrations } from "./schema";
import type { NewIntegration, NewFanficIntegration } from "./types";

export async function getIntegrations(userId: string) {
  return await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId));
}

export async function getIntegrationsByCategory(
  userId: string,
  category: string
) {
  return await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.userId, userId), eq(integrations.category, category))
    );
}

export async function getCloudStorageIntegrations(userId: string) {
  return await getIntegrationsByCategory(userId, "cloud_storage");
}

export async function getDeliveryIntegrations(userId: string) {
  return await getIntegrationsByCategory(userId, "delivery");
}

export async function getIntegration(integrationId: number) {
  const integration = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, integrationId));
  return integration ? integration[0] : null;
}

export async function getActiveIntegrations(userId: string) {
  const userIntegrations = await getIntegrations(userId);
  return userIntegrations.filter((integration) => integration.isActive);
}

type IntegrationData = Omit<
  NewIntegration,
  "id" | "creationTime" | "updateTime"
>;

export async function createIntegration(data: IntegrationData) {
  const result = await db
    .insert(integrations)
    .values({
      category: data.category,
      userId: data.userId,
      type: data.type,
      name: data.name,
      config: data.config,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath("/settings");
  return result[0];
}

export async function updateIntegration(
  id: number,
  data: Partial<IntegrationData>
) {
  const updateData: Partial<NewIntegration> = {
    ...data,
    updateTime: new Date(),
  };

  const result = await db
    .update(integrations)
    .set(updateData)
    .where(eq(integrations.id, id))
    .returning();

  revalidatePath("/settings");
  return result[0];
}

export async function deleteIntegration(id: number) {
  await db
    .delete(fanficIntegrations)
    .where(eq(fanficIntegrations.integrationId, id));
  await db.delete(integrations).where(eq(integrations.id, id));
  revalidatePath("/settings");
}

export async function setActiveIntegration(
  userId: string,
  integrationId: number
) {
  await db
    .update(integrations)
    .set({ isActive: false })
    .where(eq(integrations.userId, userId));

  await db
    .update(integrations)
    .set({ isActive: true })
    .where(eq(integrations.id, integrationId));

  revalidatePath("/settings");
}

export async function getEmailIntegration(userId: string) {
  const emailIntegrations = await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.userId, userId), eq(integrations.type, "email"))
    );

  return emailIntegrations[0] || null;
}

export async function getUserEmailAddress(
  userId: string
): Promise<string | null> {
  const emailIntegration = await getEmailIntegration(userId);
  return emailIntegration?.config?.readerEmail || null;
}

export async function getFanficIntegration(
  sectionFanficId: number,
  integrationId: number
) {
  const fanficIntegration = await db
    .select()
    .from(fanficIntegrations)
    .where(
      and(
        eq(fanficIntegrations.sectionFanficId, sectionFanficId),
        eq(fanficIntegrations.integrationId, integrationId)
      )
    );

  return fanficIntegration[0] || null;
}

export async function createOrUpdateFanficIntegration(
  sectionFanficId: number,
  integrationId: number,
  updates: Partial<NewFanficIntegration> = {}
) {
  const existing = await getFanficIntegration(sectionFanficId, integrationId);

  if (existing) {
    return await db
      .update(fanficIntegrations)
      .set({
        ...updates,
        lastTriggered: new Date(),
        updateTime: new Date(),
      })
      .where(eq(fanficIntegrations.id, existing.id))
      .returning();
  } else {
    return await db
      .insert(fanficIntegrations)
      .values({
        sectionFanficId,
        integrationId,
        enabled: true,
        lastTriggered: new Date(),
        ...updates,
      })
      .returning();
  }
}

export async function updateFanficIntegrationLastTriggered(
  sectionFanficId: number,
  userId: string
) {
  // Get the user's email integration
  const emailIntegration = await getEmailIntegration(userId);
  if (!emailIntegration) {
    throw new Error("No email integration found for user");
  }

  // Update or create the fanficIntegration record
  return await createOrUpdateFanficIntegration(
    sectionFanficId,
    emailIntegration.id
  );
}

export async function getFanficLastSent(
  sectionFanficId: number,
  userId: string
): Promise<Date | null> {
  const emailIntegration = await getEmailIntegration(userId);
  if (!emailIntegration) {
    return null;
  }

  const fanficIntegration = await getFanficIntegration(
    sectionFanficId,
    emailIntegration.id
  );
  return fanficIntegration?.lastTriggered || null;
}
