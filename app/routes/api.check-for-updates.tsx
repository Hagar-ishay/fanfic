import * as db from "@/db/db";
import { getFanfic } from "@/server/ao3Client";
import { fanficExtractor } from "@/server/extractor";
import { json } from "@remix-run/node";
import NodeCache from "node-cache";

const nextRunCache = new NodeCache({ stdTTL: 7200, checkperiod: 120 });

export const action = async () => {
	const updatedFanfics: string[] = [];
	if (nextRunCache.get("updated")) {
		return json({
			success: true,
			isCache: true,
			data: { updatedFanfics },
			message: "",
		});
	}

	try {
		const fanfics = await db.selectOngoingFanfics();
		const updatedFanfics: string[] = [];

		await Promise.all(
			fanfics.map(async (fanfic) => {
				const fanficId = fanfic.fanficId.toString();
				const updatedFic = await getFanfic(fanficId);
				const parsedFanfic = await fanficExtractor(updatedFic, fanficId);
				const latestStartingChapter = parsedFanfic?.chapterCount.split("/")[0];

				if (
					parsedFanfic?.updatedAt &&
					parsedFanfic?.updatedAt > fanfic.updatedAt
				) {
					await db.updateFanfic(fanfic.id, {
						...parsedFanfic,
						latestStartingChapter,
					});
					updatedFanfics.push(fanfic.title);
				}
			}),
		);

		nextRunCache.set("updated", true);
		return json({
			success: true,
			data: { updatedFanfics },
			isCache: false,
			message: "",
		});
	} catch (error) {
		console.error("Error checking updates:", error);
		return json({
			success: false,
			message: "An error occurred while checking updates",
			isCache: false,
			data: { updatedFanfics },
		});
	}
};
