import { getAo3Client } from "@/lib/ao3Client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Starting AO3 login cron job");
    const ao3Client = await getAo3Client();
    await ao3Client.refreshLogin();
    console.log("AO3 login cron job completed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AO3 login cron job failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh AO3 login" },
      { status: 500 }
    );
  }
}
