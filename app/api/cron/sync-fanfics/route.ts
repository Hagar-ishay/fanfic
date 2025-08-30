import { NextRequest, NextResponse } from "next/server";
import { getFanficsNeedingSync } from "@/db/fanficIntegrations";
import { syncToCloud } from "@/lib/cloudSync";
import { getAo3Client } from "@/lib/ao3Client";
import path from "path";
import fs from "fs/promises";
import { fanficIntegrations } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting fanfic sync cronjob...");

    const fanficsNeedingSync = await getFanficsNeedingSync();

    if (fanficsNeedingSync.length === 0) {
      console.log("No fanfics need syncing");
      return NextResponse.json({
        message: "No fanfics need syncing",
        count: 0,
      });
    }

    console.log(`Found ${fanficsNeedingSync.length} fanfics needing sync`);

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

        console.log(
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
        console.error(`Failed to sync fanfic ${item.fanfic.title}:`, error);
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

    console.log(
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
    console.error("Fanfic sync cronjob error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
