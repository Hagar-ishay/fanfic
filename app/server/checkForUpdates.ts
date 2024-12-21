"use server";
import { updateFanfic, selectOngoingFanfics } from "@/db/db";
import { errorMessage } from "@/lib/utils";
import { getAo3Client } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";

export async function checkForUpdates() {
  "use cache";
  const ao3Client = await getAo3Client();
  const fanfics = await selectOngoingFanfics();
  try {
    await Promise.all(
      fanfics.map(async (fanfic) => {
        const fanficId = fanfic.fanficId.toString();
        const updatedFic = await ao3Client.getFanfic(fanficId);
        const parsedFanfic = await fanficExtractor(updatedFic, fanficId);

        if (
          parsedFanfic?.updatedAt &&
          parsedFanfic?.updatedAt > fanfic.updatedAt
        ) {
          await updateFanfic(fanfic.id, parsedFanfic);
          await expirePath("/");
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
