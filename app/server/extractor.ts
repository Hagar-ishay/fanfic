import type { DownloadLink, Fanfic } from "@/types";
import * as cheerio from "cheerio";

export async function FanficExtractor(
	data: string,
	url: string,
): Promise<Fanfic | null> {
	try {
		const $ = cheerio.load(data);

		const id = url.toString().split("/").pop()?.split("?")[0] ?? "";

		const sourceUrl = url;

		const title = $("h2.title").text().trim();

		const author = $("a[rel=author]").text().trim();

		const summary = $("blockqunpmote.summary").text().trim();

		const updatedAt = $("dd.status > p").text().trim();

		const hasUpdate = updatedAt !== "";

		const downloadLinks: DownloadLink[] = [];
		$("li.download ul.expandable.secondary > li > a").each((_, el) => {
			const link = `https://archiveofourown.org${$(el).attr("href") ?? ""}`;
			const type = $(el).text().trim();
			downloadLinks.push({ type, link });
		});

		return {
			id,
			title,
			downloadLinks,
			author,
			summary,
			sourceUrl,
			updatedAt,
			hasUpdate,
		};
	} catch (error) {
		console.error("Error fetching or parsing AO3 metadata:", error);
		return null;
	}
}
