"use server";

import { updateFanfic } from "@/db/fanfics";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { errorMessage } from "@/lib/utils";
import { expirePath } from "next/cache";

export async function checkAndUpdateFanfic({
  id,
  fanficId,
  title,
  updatedAt,
  sectionId,
}: {
  id: number;
  fanficId: number;
  title: string;
  updatedAt: Date;
  sectionId: number;
}) {
  try {
    const ao3Client = await getAo3Client();
    const updatedFic = await ao3Client.getFanfic(fanficId.toString());
    const parsedFanfic = await htmlParser(updatedFic, fanficId.toString());

    if (parsedFanfic?.updatedAt && parsedFanfic.updatedAt > updatedAt) {
      await updateFanfic(id, parsedFanfic);
      expirePath(`/library/sections/${sectionId}`);
      return { success: true, message: `Updated ${title} successfully!` };
    }

    return { success: true, message: "No updates available" };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update ${title}: ${errorMessage(error)}`,
    };
  }
}
