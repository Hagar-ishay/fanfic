import { selectFanfics } from "@/db/db"; // Assuming this is your DB function
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
	const sectionId = params.sectionId;
	if (!sectionId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const fanfics = await selectFanfics(+sectionId);
	return json({ fanfics });
}
