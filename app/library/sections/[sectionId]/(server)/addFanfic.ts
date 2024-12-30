"use server";

import { AO3_LINK } from "@/consts";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";
import { getAo3Client } from "@/lib/ao3Client";
import { errorMessage } from "@/lib/utils";
import { insertFanfic, insertSectionFanfic } from "@/db/fanfics";
import { getSection } from "@/db/sections";
import { htmlParser } from "@/lib/htmlParser";

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
    const data = await ao3Client.getFanfic(fanficId);
    const metadata = await htmlParser(data, fanficId);

    if (metadata) {
      const newFanficId = await insertFanfic({ ...metadata });
      await insertSectionFanfic(sectionId, userId, newFanficId);

      expirePath("/");
      return { success: true, message: "" };
    }
  } catch (error) {
    let err = errorMessage(error);
    if (err.includes("duplicate key value violates unique constraint")) {
      err = "This Fic already exists";
    }
    return { success: false, message: err };
  }

  return { success: false, message: "Failed to create Fic" };
}
