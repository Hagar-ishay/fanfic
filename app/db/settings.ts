"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { settings, integrations } from "./schema";
import type { NewSettings } from "./types";

export async function getSettings(userId: string) {
  "use cache";
  const userSettings = await db.select().from(settings).where(eq(settings.userId, userId));

  return (
    userSettings[0] || {
      activeIntegrationId: null,
      languageCode: "en",
      enableTranslation: false,
    }
  );
}

type SettingsData = Omit<NewSettings, 'id' | 'creationTime' | 'updateTime'>;

export async function createSettings(data: SettingsData) {
  return db
    .insert(settings)
    .values({
      userId: data.userId,
      activeIntegrationId: data.activeIntegrationId,
      languageCode: data.languageCode,
      enableTranslation: data.enableTranslation,
    })
    .returning();
}

export async function updateSettings(id: number, data: SettingsData) {
  const updateData: Partial<NewSettings> = {
    activeIntegrationId: data.activeIntegrationId,
    languageCode: data.languageCode,
    enableTranslation: data.enableTranslation,
    updateTime: new Date(),
  };

  return db
    .update(settings)
    .set(updateData)
    .where(eq(settings.id, id))
    .returning();
}

export async function saveSettings(data: SettingsData & { id?: number }) {
  if (data.id) {
    const { id, ...updateData } = data;
    return updateSettings(id, updateData);
  }
  const result = await createSettings(data);
  revalidatePath("/settings");
  return result;
}
