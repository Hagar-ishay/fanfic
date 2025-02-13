"use server";

import { eq } from "drizzle-orm";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";
import { db } from "./db";
import { settings } from "./schema";

export async function getSettings(userId: string) {
  const userSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId));

  return (
    userSettings[0] || {
      kindleEmail: "",
      languageCode: "en",
      enableTranslation: false,
    }
  );
}

interface SettingsData {
  userId: string;
  kindleEmail: string | null;
  languageCode: string;
  enableTranslation: boolean;
}

export async function createSettings(data: SettingsData) {
  return db
    .insert(settings)
    .values({
      userId: data.userId,
      kindleEmail: data.kindleEmail,
      languageCode: data.languageCode,
      enableTranslation: data.enableTranslation,
    })
    .returning();
}

export async function updateSettings(id: number, data: SettingsData) {
  return db
    .update(settings)
    .set({
      kindleEmail: data.kindleEmail,
      languageCode: data.languageCode,
      enableTranslation: data.enableTranslation,
      updateTime: new Date(),
    })
    .where(eq(settings.id, id))
    .returning();
}

export async function saveSettings(data: SettingsData & { id?: number }) {
  if (data.id) {
    const { id, ...updateData } = data;
    return updateSettings(id, updateData);
  }
  const result = await createSettings(data);
  expirePath("/settings");
  return result;
}
