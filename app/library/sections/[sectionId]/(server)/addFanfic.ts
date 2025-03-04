"use server";

import { VALID_AO3_URLS } from "@/consts";
import { getFanficByExternalId, insertFanfic, insertSectionFanfic } from "@/db/fanfics";
import { getSection } from "@/db/sections";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { errorMessage } from "@/lib/utils";

export async function addFanfic(sectionId: number, userId: string, fanficUrl: string) {
  const ao3Url = VALID_AO3_URLS.find((url) => fanficUrl.startsWith(url));
  if (!ao3Url) {
    return { success: false, message: "Invalid URL. Please copy a valid AO3 fanfic link" };
  }
  const externalId = fanficUrl.toString().replace(`${ao3Url}/works/`, "").split("/")[0] ?? "";

  try {
    const [section, existingFanfic] = await Promise.all([getSection(sectionId), getFanficByExternalId(+externalId)]);

    if (section?.userId !== userId) {
      return { success: false, message: "Invalid section request" };
    }

    let dbFanficId = existingFanfic?.id;

    if (!dbFanficId) {
      const ao3Client = await getAo3Client();
      const data = await ao3Client.getFanfic(externalId);
      const metadata = await htmlParser(data, externalId);

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
