"use server";
import { errorMessage } from "@/lib/utils";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { NextResponse } from "next/server";
import { selectOngoingFanfics, updateFanfic } from "@/db/fanfics";

export async function GET() {
  const ao3Client = await getAo3Client();
  const fanfics = await selectOngoingFanfics();
  try {
    await Promise.all(
      fanfics.map(async (fanfic) => {
        const fanficId = fanfic.fanficId.toString();
        const updatedFic = await ao3Client.getFanfic(fanficId);
        const parsedFanfic = await htmlParser(updatedFic, fanficId);

        if (
          parsedFanfic?.updatedAt &&
          parsedFanfic?.updatedAt > fanfic.updatedAt
        ) {
          await updateFanfic(fanfic.id, parsedFanfic);
        }
      })
    );
  } catch (error) {
    console.error(errorMessage(error));
  }
  return NextResponse.json({ ok: true });
}
