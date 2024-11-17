import type { Fanfic } from "@/db/types";
import { ENV } from "@/server/config";
import { TranslationServiceClient } from "@google-cloud/translate";
import EPub from "epub";
import EpubGen from "epub-gen";

const translate = new TranslationServiceClient({
	projectId: ENV.GOOGLE_PROJECT_ID,
	keyFilename: ENV.GOOGLE_SERVICE_ACCOUNT_JSON,
});

export const translateFic = async (
	fanfic: Fanfic,
	epubFilePath: string,
	translationLanguage: string,
): Promise<{ downloadPath: string; fileName: string; title: string }> => {
	if (!fanfic.language) {
		throw "No Language set to translate";
	}
	const epub = new EPub(epubFilePath);
	const sourceLanguage = fanfic.language;

	const [translatedTitle, translatedAuthor] = await translateMetadata(
		[fanfic.title, fanfic.author],
		sourceLanguage,
		translationLanguage,
	);

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
							targetLanguageCode: translationLanguage,
						});
						if (response.translations) {
							translatedChunks.push(response.translations[0].translatedText);
						}
					}

					translatedChapters.push({
						title: await translateChapterTitle(
							chapter.title,
							sourceLanguage,
							translationLanguage,
						),
						content: translatedChunks.join(" "),
					});
				}

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

async function translateMetadata(
	contents: string[],
	sourceLanguage: string,
	translationLanguage: string,
) {
	const [response] = await translate.translateText({
		parent: `projects/${ENV.GOOGLE_PROJECT_ID}/locations/global`,
		contents,
		mimeType: "text/plain",
		sourceLanguageCode: sourceLanguage,
		targetLanguageCode: translationLanguage,
	});

	return (
		response.translations?.map((t) => t.translatedText ?? "") || [
			"Unknown Title",
			"unknown Author",
		]
	);
}
async function translateChapterTitle(
	title: string,
	sourceLanguage: string,
	translationLanguage: string,
) {
	const [response] = await translate.translateText({
		parent: `projects/${ENV.GOOGLE_PROJECT_ID}/locations/global`,
		contents: [title],
		mimeType: "text/plain",
		sourceLanguageCode: sourceLanguage,
		targetLanguageCode: translationLanguage,
	});

	if (typeof response.translations?.[0].translatedText === "string") {
		return response.translations[0].translatedText;
	}

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
			title: fanfic.title,
			author: fanfic.author,
			publisher: "https://archiveofourown.org",
			content,
		},
		`/tmp/translated/${fanfic.title}.epub`,
	);

	return epub.promise
		.then(() => {
			return {
				downloadPath: `/tmp/translated/${fanfic.title}.epub`,
				fileName: `${fanfic.title}.epub`,
				title: fanfic.title,
			};
		})
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
