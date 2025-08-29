"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { integrations } from "./schema";
import type { NewIntegration } from "./types";

export async function getIntegrations(userId: string) {
  "use cache";
  return await db.select().from(integrations).where(eq(integrations.userId, userId));
}

export async function getIntegration(integrationId: number) {
  "use cache";
  const integration = await db.select().from(integrations).where(eq(integrations.id, integrationId));
  return integration ? integration[0] : null;
}

export async function getActiveIntegration(userId: string) {
  "use cache";
  const userIntegrations = await getIntegrations(userId);
  return userIntegrations.find(integration => integration.isActive) || null;
}

type IntegrationData = Omit<NewIntegration, 'id' | 'creationTime' | 'updateTime'>;

export async function createIntegration(data: IntegrationData) {
  const result = await db
    .insert(integrations)
    .values({
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

export async function updateIntegration(id: number, data: Partial<IntegrationData>) {
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
  await db.delete(integrations).where(eq(integrations.id, id));
  revalidatePath("/settings");
}

export async function setActiveIntegration(userId: string, integrationId: number) {
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