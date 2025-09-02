"use server";

import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";
import { getSettings } from "@/db/settings";
import { SearchResult } from "./search";

export async function addFanficFromSearch(
  searchResult: SearchResult,
  userId: string,
  sectionId?: number
): Promise<{ success: boolean; message: string; sectionId?: number }> {
  let targetSectionId: number | null | undefined = sectionId;

  if (!targetSectionId) {
    const userSettings = await getSettings(userId);
    targetSectionId = userSettings.defaultSectionId;

    if (!targetSectionId) {
      return {
        success: false,
        message:
          "No default section set. Please choose a section or set a default in settings.",
      };
    }
  }

  const result = await addFanfic(
    targetSectionId,
    userId,
    searchResult.sourceUrl
  );

  return {
    ...result,
    sectionId: targetSectionId,
  };
}

export async function addFanficToDefaultSection(
  searchResult: SearchResult,
  userId: string
): Promise<{ success: boolean; message: string; sectionId?: number }> {
  return addFanficFromSearch(searchResult, userId);
}
