"use server";

import { getAo3Client } from "@/lib/ao3Client";
import { errorMessage } from "@/lib/utils";
import { updateSectionFanfic } from "@/db/fanfics";

export async function sendKudos({
  externalId,
  sectionId,
  fanficId,
  currentKudos,
}: {
  externalId: string | number;
  sectionId: number;
  fanficId: number;
  currentKudos: boolean;
}) {
  try {
    if (!currentKudos) {
      const ao3Client = await getAo3Client();
      await ao3Client.kudos(String(externalId));
    }
    await updateSectionFanfic(sectionId, fanficId, {
      kudos: !currentKudos,
    });

    return { success: true, message: "", kudos: !currentKudos };
  } catch (error) {
    const err = errorMessage(error);
    if (err.includes("You have already left kudos here")) {
      await updateSectionFanfic(sectionId, fanficId, {
        kudos: !currentKudos,
      });
      return { success: true, message: "", kudos: !currentKudos };
    }
    return { success: false, message: err, kudos: currentKudos };
  }
}
