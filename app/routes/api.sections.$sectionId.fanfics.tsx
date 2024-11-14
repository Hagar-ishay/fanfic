import * as consts from "@/consts";
import { insertFanfic, selectFanfics } from "@/db/db";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "react-router-dom";

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

export const action = async ({ params, request }: LoaderFunctionArgs) => {
	const sectionId = params.sectionId;
	const formData = await request.formData();
	if (!sectionId) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	switch (request.method) {
		case "POST": {
			const fanficUrl = formData.get("url") as string;
			const fanficId =
				fanficUrl
					.toString()
					.replace(`${consts.AO3_LINK}/works/`, "")
					.split("/")[0] ?? "";
			const data = await getFanfic(fanficId);
			const metadata = await fanficExtractor(data, fanficId);
			if (metadata) {
				try {
					await insertFanfic(metadata);
					return json({ success: true, message: "" });
				} catch (error) {
					const errorMessage =
						(typeof error === "string" && error) ||
						(error instanceof Error && error.message) ||
						"Unknown Error";

					return json(
						{ success: false, message: errorMessage },
						{ status: 500 },
					);
				}
			}
			return json(null);
		}

		default:
			throw new Response("Method Not Allowed", { status: 405 });
	}
};
