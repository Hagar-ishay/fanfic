"use server";
import { errorMessage } from "@/lib/utils";
import { getAo3Client } from "@/lib/ao3Client";
import { htmlParser } from "@/lib/htmlParser";
import { NextResponse } from "next/server";
import { selectOngoingFanfics, updateFanfic } from "@/db/fanfics";

export async function GET(request: Request) {
  // Verify that the request is coming from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
    // Return error status for monitoring purposes
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
