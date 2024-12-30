"use server";

import { deleteFanfic, insertFanfic, updateFanfic } from "@/db/db";
import { AO3_LINK } from "@/consts";
import { expirePath } from "next/dist/server/web/spec-extension/revalidate";
import { getAo3Client } from "@/server/ao3Client";
import { errorMessage } from "@/lib/utils";
import { extractFanfic } from "@/server/extractor";

export async function addFanfic(sectionId: number, fanficUrl: string) {
  const ao3Client = await getAo3Client();
  const fanficId =
    fanficUrl.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";

  try {
    const data = await ao3Client.getFanfic(fanficId);
    const parsedFanfic = await extractFanfic(data, fanficId);

    if (parsedFanfic) {
      await insertFanfic({ ...parsedFanfic, sectionId });
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

export async function updateFic(fanficId: number, params: object) {
  await updateFanfic(fanficId, params);
  expirePath("/");
}

export async function deleteFic(fanficId: number) {
  await deleteFanfic(fanficId);
  expirePath("/");
}
