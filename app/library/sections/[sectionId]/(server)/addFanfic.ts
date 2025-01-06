"use server";

import { AO3_LINK } from "@/consts";
import {
  getFanficByExternalId,
  getFanficById,
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
  const section = await getSection(sectionId);
  if (section?.userId !== userId) {
    return { success: false, message: "Invalid section request" };
  }

  const ao3Client = await getAo3Client();
  const fanficId =
    fanficUrl.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";

  try {
    const fanfic = await getFanficByExternalId(+fanficId);
    let dbFanficId = fanfic?.id;
    if (!dbFanficId) {
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
