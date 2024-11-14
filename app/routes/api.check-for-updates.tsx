import * as db from "@/db/db";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import NodeCache from "node-cache";

const nextRunCache = new NodeCache({ stdTTL: 7200, checkperiod: 120 });

export const action: ActionFunction = async ({ request }) => {
	if (nextRunCache.get("updated")) {
		return json({ success: true, message: "" });
	}

	try {
		const fanfics = await db.selectOngoingFanfics();

		await Promise.all(
			fanfics.map(async (fanfic) => {
				const fanficId = fanfic.fanficId.toString();
				const updatedFic = await getFanfic(fanficId);
				const parsedFanfic = await fanficExtractor(updatedFic, fanficId);

				if (
					parsedFanfic?.updatedAt &&
					parsedFanfic?.updatedAt > fanfic.updatedAt
				) {
					await db.updateFanfic(fanfic.id, parsedFanfic);
				}
			}),
		);

		nextRunCache.set("updated", true);
		return json({ success: true, message: "" });
	} catch (error) {
		console.error("Error checking updates:", error);
		return json({
			success: false,
			message: "An error occurred while checking updates",
		});
	}
};
