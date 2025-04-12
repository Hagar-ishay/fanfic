"use server";

import { getAo3Client } from "@/lib/ao3Client";
import { errorMessage } from "@/lib/utils";
import { updateSectionFanfic } from "@/db/fanfics";

export async function sendKudos({
  externalId,
  sectionId,
  userFanficId,
  currentKudos,
}: {
  externalId: string | number;
  sectionId: number;
  userFanficId: number;
  currentKudos: boolean;
}) {
  try {
    if (!currentKudos) {
      const ao3Client = await getAo3Client();
      await ao3Client.kudos(String(externalId));
    }
    await updateSectionFanfic(sectionId, userFanficId, {
      kudos: !currentKudos,
    });

    return { success: true, message: "", kudos: !currentKudos };
  } catch (error) {
    const err = errorMessage(error);
    if (err.includes("You have already left kudos here")) {
      await updateSectionFanfic(sectionId, userFanficId, {
        kudos: !currentKudos,
      });
      return { success: true, message: "", kudos: !currentKudos };
    }
    return { success: false, message: err, kudos: currentKudos };
  }
}
