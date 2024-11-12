import fs from "node:fs";
import * as consts from "@/consts";
import got from "got";

const httpsOptions = { https: { rejectUnauthorized: false } };

export async function getFanfic(fanficId: string): Promise<string> {
	const url = `${consts.AO3_LINK}/works/${fanficId}?view_full_work=true&view_adult=true`;
	const { body } = await got(url, httpsOptions);
	return body;
}

export async function downloadFanfic(url: string, downloadPath: string) {
	const downloadStream = got.stream(url, httpsOptions);

	await new Promise((resolve, reject) => {
		downloadStream
			.pipe(fs.createWriteStream(downloadPath))
			.on("finish", resolve)
			.on("error", reject);
	});
}
