"use server";

import { insertFanfic, selectOngoingFanfics, updateFanfic } from "@/db/db";
import { getFanfic } from "./ao3Client";
import { fanficExtractor } from "./extractor";
import { AO3_LINK } from "@/consts";
import { revalidatePath } from "next/cache";


export async function checkForUpdates() {
  'use cache'
  const updatedFanfics: string[] = [];

  try {
    const fanfics = await selectOngoingFanfics();
    const updatedFanfics: string[] = [];

    await Promise.all(
      fanfics.map(async (fanfic) => {
        const fanficId = fanfic.fanficId.toString();
        const updatedFic = await getFanfic(fanficId);
        const parsedFanfic = await fanficExtractor(updatedFic, fanficId);

        if (
          parsedFanfic?.updatedAt &&
          parsedFanfic?.updatedAt > fanfic.updatedAt
        ) {
          await updateFanfic(fanfic.id, parsedFanfic);
          updatedFanfics.push(fanfic.title);
        }
      })
    );

    return {
      success: true,
      data: { updatedFanfics },
      message: "",
    };
  } catch (error) {
    console.error("Error checking updates:", error);
    return {
      success: false,
      message: "An error occurred while checking updates",
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
      let err = errorMessage(error);
      if (err.includes("duplicate key value violates unique constraint")) {
        err = "This Fic already exists";
      }
      return { success: false, message: err };
    }
  }
  return { success: false, message: "Failed to create Fic" };
}

const errorMessage = (error: unknown) =>
  (typeof error === "string" && error) ||
  (error instanceof Error && error.message) ||
  "Unknown Error";

export async function updateFic(fanficId: number, params: object) {
  await updateFanfic(fanficId, params);
  revalidatePath("/");
}
