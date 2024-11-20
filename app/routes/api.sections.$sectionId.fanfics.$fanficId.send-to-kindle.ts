import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { updateFanfic } from "@/db/db";
import type { Fanfic } from "@/db/types";
import { downloadFanfic } from "@/server/ao3Client";
import { sendToKindle } from "@/server/kindleSender";
import { translateChapter, translateMetadata } from "@/server/translator";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import EPub from "epub";
import EpubGen from "epub-gen";

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const kindleEmail = formData.get("kindleEmail") as string;
	const translationLanguage = formData.get("translationLanguage") as string;
	const fanfic: Fanfic = JSON.parse(formData.get("fanfic") as string);
	const startingChapter: number | null = JSON.parse(
		formData.get("startingChapter") as string,
	);

	const shouldTranslate = Boolean(
		fanfic.language &&
			translationLanguage &&
			fanfic.language !== translationLanguage,
	);
	const fileName = `${fanfic.title.replace(" ", "_")}.epub`;
	const downloadPath = path.resolve(`/tmp/${fileName}`);
	let title = fanfic.title;
	let author = fanfic.author;

	try {
		await downloadFanfic(fanfic.downloadLink, downloadPath);

		if (startingChapter || shouldTranslate) {
			console.log("Translating");
			const { translatedTitle, translatedAuthor } = await translateMetadata({
				title: fanfic.title,
				author: fanfic.author,
			});

			title = translatedTitle;
			author = translatedAuthor;

			console.log("Parsing");

			const chapters = await ParseFanfic(
				downloadPath,
				startingChapter,
				shouldTranslate,
			);

			const data = {
				title: title,
				author: author,
				publisher: "https://archiveofourown.org",
				content: chapters,
			};

			await buildNewEpub(data, downloadPath);
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
		let errorMessage =
			(typeof error === "string" && error) ||
			(error instanceof Error && error.message) ||
			"";

		if (
			errorMessage.includes("The model is overloaded. Please try again later")
		) {
			errorMessage =
				"Gemini Translation is unavailable. Please try again later.";
		}

		if (fs.existsSync(downloadPath)) {
			await unlinkAsync(downloadPath);
		}
		return json({ success: false, message: errorMessage }, { status: 500 });
	}
};

async function ParseFanfic(
	downloadPath: string,
	startingChapter: number | null,
	shouldTranslate: boolean,
) {
	const epub = new EPub(downloadPath);
	const chapters: { data: string; title: string }[] = [];

	epub.on("end", async (reject) => {
		try {
			const startingSlice = startingChapter || 0;
			for (const chapter of epub.flow.slice(startingSlice)) {
				const chapterText = await getChapter(epub, chapter.id);
				if (shouldTranslate) {
					const chapterData = await translateChapter(
						chapterText,
						chapter.title,
					);
					chapters.push(chapterData);
				} else {
					chapters.push({
						data: chapterText,
						title: chapter.title,
					});
				}
			}
		} catch (error) {
			reject(error);
		}
	});

	epub.parse();

	return chapters;
}

function getChapter(epub: EPub, chapterId: string): Promise<string> {
	return new Promise((resolve, reject) => {
		epub.getChapter(chapterId, (err, text) => {
			if (err) {
				reject(err);
			} else {
				resolve(text);
			}
		});
	});
}

async function buildNewEpub(newEpub: EpubGen.Options, downloadPath: string) {
	const epub = new EpubGen(newEpub, downloadPath);

	return epub.promise
		.then(() => {
			return {
				downloadPath: downloadPath,
				fileName: `${newEpub.title}.epub`,
				title: newEpub.title,
			};
		})
		.catch((err) => {
			throw new Error(`Failed to generate EPUB: ${err.message}`);
		});
}
