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
  console.time("Server total execution");
  const fanficId =
    fanficUrl.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";

  try {
    console.time("Initial parallel operations");
    const [section, existingFanfic] = await Promise.all([
      getSection(sectionId),
      getFanficByExternalId(+fanficId),
    ]);
    console.timeEnd("Initial parallel operations");

    if (section?.userId !== userId) {
      return { success: false, message: "Invalid section request" };
    }

    let dbFanficId = existingFanfic?.id;

    if (!dbFanficId) {
      console.time("AO3 client initialization");
      const ao3Client = await getAo3Client();
      console.timeEnd("AO3 client initialization");

      console.log("Fetching fanfic from AO3");
      console.time("AO3 fetch request");
      const data = await ao3Client.getFanfic(fanficId);
      console.timeEnd("AO3 fetch request");

      console.time("HTML parsing");
      const metadata = await htmlParser(data, fanficId);
      console.timeEnd("HTML parsing");

      if (!metadata) {
        return { success: false, message: "Failed to parse Fic" };
      }

      console.time("DB fanfic insertion");
      dbFanficId = await insertFanfic({ ...metadata });
      console.timeEnd("DB fanfic insertion");
    }

    console.time("Section fanfic insertion");
    await insertSectionFanfic(sectionId, userId, dbFanficId);
    console.timeEnd("Section fanfic insertion");

    console.timeEnd("Server total execution");
    return { success: true, message: "" };
  } catch (error) {
    console.timeEnd("Server total execution");
    console.log({ error });
    let err = errorMessage(error);
    if (err.includes("duplicate key value violates unique constraint")) {
      err = "This Fic already exists";
    }
    return { success: false, message: err };
  }
}
