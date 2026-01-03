import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/auth/mobile";
import { listUserSections, insertSection } from "@/db/sections";

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyMobileToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sections = await listUserSections(userId);

    return NextResponse.json({
      data: sections,
    });
  } catch (error) {
    console.error("Get sections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyMobileToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid section name" },
        { status: 400 }
      );
    }

    const sectionId = await insertSection({ name, userId });

    return NextResponse.json({
      data: { id: sectionId, name, userId },
    });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
