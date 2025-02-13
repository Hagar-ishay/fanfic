"use server";

import { AO3_LINK } from "@/consts";
import {
  getFanficByExternalId,
  insertFanfic,
  insertSectionFanfic,
} from "@/db/fanfics";
import { getSection } from "@/db/sections";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { errorMessage } from "@/lib/utils";

export async function addFanfic(
  sectionId: number,
  userId: string,
  fanficUrl: string
) {
  const fanficId =
    fanficUrl.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";

  try {
    // Run section check and fanfic lookup in parallel
    const [section, existingFanfic] = await Promise.all([
      getSection(sectionId),
      getFanficByExternalId(+fanficId),
    ]);

    if (section?.userId !== userId) {
      return { success: false, message: "Invalid section request" };
    }

    let dbFanficId = existingFanfic?.id;

    if (!dbFanficId) {
      const ao3Client = await getAo3Client();
      const data = await ao3Client.getFanfic(fanficId);
      const metadata = await htmlParser(data, fanficId);

      if (!metadata) {
        return { success: false, message: "Failed to parse Fic" };
      }
      dbFanficId = await insertFanfic({ ...metadata });
    }

    await insertSectionFanfic(sectionId, userId, dbFanficId);
    return { success: true, message: "" };
  } catch (error) {
    console.log({ error });
    let err = errorMessage(error);
    if (err.includes("duplicate key value violates unique constraint")) {
      err = "This Fic already exists";
    }
    return { success: false, message: err };
  }
}
