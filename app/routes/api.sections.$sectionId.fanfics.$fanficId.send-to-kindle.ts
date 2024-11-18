import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { updateFanfic } from "@/db/db";
import type { Fanfic } from "@/db/types";
import { downloadFanfic } from "@/server/ao3Client";
import { sendToKindle } from "@/server/kindleSender";
import { translateFic } from "@/server/translator";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const kindleEmail = formData.get("kindleEmail") as string;
	const translationLanguage = formData.get("translationLanguage") as string;
	const fanfic: Fanfic = JSON.parse(formData.get("fanfic") as string);
	let fileName = `${fanfic.title.replace(" ", "_")}.epub`;
	let downloadPath = path.resolve(`/tmp/${fileName}`);
	let title = fanfic.title;

	try {
		await downloadFanfic(fanfic.downloadLink, downloadPath);
		if (
			fanfic.language &&
			translationLanguage &&
			fanfic.language !== translationLanguage
		) {
			const translated = await translateFic(
				fanfic,
				downloadPath,
				translationLanguage,
			);

			await unlinkAsync(downloadPath);

			fileName = translated.fileName;
			downloadPath = translated.downloadPath;
			title = translated.title;
		}

		await sendToKindle(kindleEmail, title, fileName, downloadPath);
		const stats = await statAsync(downloadPath);
		if (stats.size === 0) {
			await unlinkAsync(downloadPath);
			throw new Error("Downloaded file is empty.");
		}

		await unlinkAsync(downloadPath);
		updateFanfic(fanfic.id, { lastSent: new Date(Date.now()) });
		return json({ success: true, message: "" });
	} catch (error) {
		const errorMessage =
			(typeof error === "string" && error) ||
			(error instanceof Error && error.message) ||
			"";

		if (fs.existsSync(downloadPath)) {
			await unlinkAsync(downloadPath);
		}
		return json({ success: false, message: errorMessage }, { status: 500 });
	}
};
