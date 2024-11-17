// app/api/fetch-data/route.js
import { listFanfics, selectSections } from "@/db/db";

export async function GET(request: Request) {
	const fanfics = await listFanfics();
	const sections = await selectSections();
	return new Response(JSON.stringify({ fanfics, sections }), { status: 200 });
}
