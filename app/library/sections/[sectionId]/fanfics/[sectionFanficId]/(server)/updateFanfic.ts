"use server";

import { updateFanfic } from "@/db/fanfics";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { errorMessage } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function checkAndUpdateFanfic({
  fanficId,
  externalId,
  title,
  updatedAt,
  sectionId,
}: {
  fanficId: number;
  externalId: number;
  title: string;
  updatedAt: Date;
  sectionId: number;
}) {
  try {
    const ao3Client = await getAo3Client();
    const updatedFic = await ao3Client.getFanfic(externalId.toString());
    const parsedFanfic = htmlParser(updatedFic, externalId.toString());
    if (parsedFanfic?.updatedAt && parsedFanfic.updatedAt > updatedAt) {
      await updateFanfic(fanficId, parsedFanfic);
      revalidatePath(`/library/sections/${sectionId}`);
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
