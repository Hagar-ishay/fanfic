import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUserSections } from "@/db/sections";
import { getSettings } from "@/db/settings";
import logger from "@/logger";
import { errorMessage } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sections, settings] = await Promise.all([
      listUserSections(session.user.id),
      getSettings(session.user.id),
    ]);

    return NextResponse.json({
      sections: sections.map((section) => ({
        id: section.id,
        name: section.name,
        parentId: section.parentId,
      })),
      defaultSectionId: settings.defaultSectionId,
    });
  } catch (error) {
    logger.error(`Share extension sections error: ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}
