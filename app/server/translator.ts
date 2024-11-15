import type { Fanfic } from "@/db/types";
import { ENV } from "@/server/config";
import Translate from "@google-cloud/translate";
import { json } from "@remix-run/node";
import EPub from "epub";
import EpubGen from "epub-gen";

const TRANSLATION_LANGUAGE = "en";

const translate = new Translate.TranslationServiceClient({
	projectId: ENV.GOOGLE_PROJECT_ID,
	keyFilename: ENV.GOOGLE_SERVICE_ACCOUNT_JSON,
});

export const translateFic = async (
	fanfic: Fanfic,
	epubFilePath: string,
): Promise<string> => {
	const sourceLanguage = fanfic.language;
	if (!sourceLanguage || sourceLanguage === TRANSLATION_LANGUAGE) {
		return epubFilePath;
	}
	const epub = new EPub(epubFilePath);

	return new Promise((resolve, reject) => {
		epub.on("end", async () => {
			try {
				const translatedChapters = [];

				for (const chapter of epub.flow) {
					const chapterText = await getChapterAsync(epub, chapter.id);

					const chunks = splitTextIntoChunks(chapterText, 5000);

					const translatedChunks = [];
					for (const chunk of chunks) {
						const [response] = await translate.translateText({
							parent: `projects/${ENV.GOOGLE_PROJECT_ID}/locations/global`,
							contents: [chunk],
							mimeType: "text/plain",
							sourceLanguageCode: sourceLanguage,
							targetLanguageCode: TRANSLATION_LANGUAGE,
						});
						if (response.translations) {
							translatedChunks.push(response.translations[0].translatedText);
						}
					}

					translatedChapters.push({
						title: await translateChapterTitle(chapter.title, sourceLanguage),
						content: translatedChunks.join(" "),
					});
				}

				const [translatedTitle, translatedAuthor] = await translateMetadata(
					[fanfic.title, fanfic.author],
					sourceLanguage,
				);

				const translatedEpub = await buildTranslatedEpub(
					{ ...fanfic, title: translatedTitle, author: translatedAuthor },
					translatedChapters,
				);

				resolve(translatedEpub);
			} catch (error) {
				reject(
					(typeof error === "string" && error) ||
						(error instanceof Error && error.message) ||
						"",
				);
			}
		});

		epub.parse();
	});
};

async function translateMetadata(contents: string[], sourceLanguage: string) {
	const [response] = await translate.translateText({
		parent: `projects/${ENV.GOOGLE_PROJECT_ID}/locations/global`,
		contents,
		mimeType: "text/plain",
		sourceLanguageCode: sourceLanguage,
		targetLanguageCode: TRANSLATION_LANGUAGE,
	});

	return (
		response.translations?.map((t) => t.translatedText ?? "") || [
			"Unknown Title",
			"unknown Author",
		]
	);
}
async function translateChapterTitle(title: string, sourceLanguage: string) {
	const [response] = await translate.translateText({
		parent: `projects/${ENV.GOOGLE_PROJECT_ID}/locations/global`,
		contents: [title],
		mimeType: "text/plain",
		sourceLanguageCode: sourceLanguage,
		targetLanguageCode: TRANSLATION_LANGUAGE,
	});

	if (typeof response.translations?.[0].translatedText === "string")
		return response.translations[0].translatedText;

	return "Unknown Chapter Title";
}

async function buildTranslatedEpub(
	fanfic: Fanfic,
	chapters: { title: string; content: string }[],
) {
	const content = chapters.map((chapter) => ({
		title: chapter.title,
		data: chapter.content,
	}));

	const epub = new EpubGen(
		{
			title: fanfic.title, // Translated title
			author: fanfic.author, // Translated author
			publisher: "https://archiveofourown.org",
			content,
		},
		`/tmp/${fanfic.title}.epub`,
	);

	return epub.promise
		.then(() => `/tmp/translated/${fanfic.title}.epub`)
		.catch((err) => {
			throw new Error(`Failed to generate EPUB: ${err.message}`);
		});
}

function splitTextIntoChunks(text: string, chunkSize: number): string[] {
	const chunks = [];
	for (let i = 0; i < text.length; i += chunkSize) {
		chunks.push(text.slice(i, i + chunkSize));
	}
	return chunks;
}

function getChapterAsync(epub: EPub, chapterId: string): Promise<string> {
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
