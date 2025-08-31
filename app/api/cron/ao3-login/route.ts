import { getAo3Client } from "@/lib/ao3Client";
import { NextResponse } from "next/server";
import logger from "@/logger";

export async function GET() {
  try {
    logger.info("Starting AO3 login cron job");
    const ao3Client = await getAo3Client();
    await ao3Client.refreshLogin();
    logger.info("AO3 login cron job completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("AO3 login cron job failed");
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    return NextResponse.json(
      { success: false, error: "Failed to refresh AO3 login" },
      { status: 500 }
    );
  }
}
