"use server";

import NodeCache from "node-cache";
import { insertFanfic, selectOngoingFanfics, updateFanfic } from "@/db/db";
import { getFanfic } from "./ao3Client";
import { fanficExtractor } from "./extractor";
import { AO3_LINK } from "@/consts";

// const nextRunCache = new NodeCache({ stdTTL: 7200, checkperiod: 120 });

export async function checkForUpdates() {
  const updatedFanfics: string[] = [];
  if (nextRunCache.get("updated")) {
    return {
      success: true,
      isCache: true,
      data: { updatedFanfics },
      message: "",
    };
  }

  try {
    const fanfics = await selectOngoingFanfics();
    const updatedFanfics: string[] = [];

    await Promise.all(
      fanfics.map(async (fanfic) => {
        const fanficId = fanfic.fanficId.toString();
        const updatedFic = await getFanfic(fanficId);
        const parsedFanfic = await fanficExtractor(updatedFic, fanficId);
        const latestStartingChapter = parsedFanfic?.chapterCount.split("/")[0];

        if (
          parsedFanfic?.updatedAt &&
          parsedFanfic?.updatedAt > fanfic.updatedAt
        ) {
          await updateFanfic(fanfic.id, {
            ...parsedFanfic,
            latestStartingChapter,
          });
          updatedFanfics.push(fanfic.title);
        }
      })
    );

    nextRunCache.set("updated", true);
    return {
      success: true,
      data: { updatedFanfics },
      isCache: false,
      message: "",
    };
  } catch (error) {
    console.error("Error checking updates:", error);
    return {
      success: false,
      message: "An error occurred while checking updates",
      isCache: false,
      data: { updatedFanfics },
    };
  }
}

export async function addFanfic(sectionId: number, fanficUrl: string) {
  const fanficId =
    fanficUrl.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";
  const data = await getFanfic(fanficId);
  const metadata = await fanficExtractor(data, fanficId);
  if (metadata) {
    try {
      await insertFanfic({ ...metadata, sectionId });
      return { success: true, message: "" };
    } catch (error) {
      return { success: false, message: errorMessage(error) };
    }
  }
  return { success: false, message: "Failed to create Fic" };
}

const errorMessage = (error: unknown) =>
  (typeof error === "string" && error) ||
  (error instanceof Error && error.message) ||
  "Unknown Error";
