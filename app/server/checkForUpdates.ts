"use server";
import { updateFanfic } from "@/db/db";
import { Fanfic } from "@/db/types";
import { errorMessage } from "@/lib/utils";
import { getAo3Client } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";

export async function checkForUpdates(fanfics: Fanfic[]) {
  "use cache";
  const ao3Client = await getAo3Client();
  try {
    await Promise.all(
      fanfics
        .filter((fanfic) => !fanfic.completedAt)
        .map(async (fanfic) => {
          const fanficId = fanfic.fanficId.toString();
          const updatedFic = await ao3Client.getFanfic(fanficId);
          const parsedFanfic = await fanficExtractor(updatedFic, fanficId);

          if (
            parsedFanfic?.updatedAt &&
            parsedFanfic?.updatedAt > fanfic.updatedAt
          ) {
            await updateFanfic(fanfic.id, parsedFanfic);
          }
        })
    );
    return { success: true, message: "" };
  } catch (err) {
    console.error(err);
    const error = errorMessage(err);
    return { success: false, message: error };
  }
}
