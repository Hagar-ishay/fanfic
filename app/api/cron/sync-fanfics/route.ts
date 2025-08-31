import { NextRequest, NextResponse } from "next/server";
import { getFanficsNeedingSync } from "@/db/fanficIntegrations";
import { syncToCloud } from "@/lib/cloudSync";
import logger from "@/logger";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    logger.info("Starting fanfic sync cronjob...");

    const fanficsNeedingSync = await getFanficsNeedingSync();

    if (fanficsNeedingSync.length === 0) {
      logger.info("No fanfics need syncing");
      return NextResponse.json({
        message: "No fanfics need syncing",
        count: 0,
      });
    }

    logger.info(`Found ${fanficsNeedingSync.length} fanfics needing sync`);

    const results = [];

    for (const item of fanficsNeedingSync) {
      try {
        // Check if fanfic has been updated since last sync
        const needsSync =
          !item.lastTriggered ||
          new Date(item.fanfic.updatedAt) > new Date(item.lastTriggered);

        if (!needsSync) {
          continue;
        }

        logger.info(
          `Syncing fanfic: ${item.fanfic.title} to ${item.integration.type}`
        );

        const syncResult = await syncToCloud({
          fanficIntegration: item,
          sectionName: item.section.name,
          fanficTitle: item.fanfic.title,
          downloadLink: item.fanfic.downloadLink,
        });

        results.push({
          fanficId: item.fanfic.id,
          fanficTitle: item.fanfic.title,
          integration: item.integration.name,
          success: syncResult.success,
          message: syncResult.message,
        });
      } catch (error) {
        logger.error(
          `Failed to sync fanfic ${item.fanfic.title}: ${error instanceof Error ? error.message : String(error)}`
        );
        results.push({
          fanficId: item.fanfic.id,
          fanficTitle: item.fanfic.title,
          integration: item.integration.name,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    logger.info(
      `Sync completed: ${successCount} successful, ${failCount} failed`
    );

    return NextResponse.json({
      message: "Fanfic sync completed",
      totalProcessed: results.length,
      successful: successCount,
      failed: failCount,
      results: results,
    });
  } catch (error) {
    logger.error(
      `Fanfic sync cronjob error: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
