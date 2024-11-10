import * as consts from "@/consts";
import type { DownloadLink, Fanfic, Tag } from "@/types";
import * as cheerio from "cheerio";
import { DateTime } from "luxon";

export async function fanficExtractor(
	data: string,
	fanficId: string,
): Promise<Fanfic | null> {
	try {
		const $ = cheerio.load(data);
		$("#admin-banner").remove();

		const parseHtml = (selector: string): string => {
			return $(selector).first().text().trim();
		};

		const parseToDate = (selector: string): DateTime => {
			return DateTime.fromISO($(selector).text().trim());
		};

		const downloadLinks: DownloadLink[] = [];
		$("li.download ul.expandable.secondary > li > a").each((_, el) => {
			const link = `${consts.AO3_LINK}${$(el).attr("href") ?? ""}`;
			const type = $(el).text().trim();
			downloadLinks.push({ type, link });
		});

		const authorLink = `${consts.AO3_LINK}${$("a[rel=author]").attr("href") ?? ""}`;

		const tags: Tag[] = [];
		$("dl.work.meta.group > dt").each((_, el) => {
			const category = $(el)
				.text()
				.trim()
				.replace(/\s+/g, " ")
				.replace(":", "")
				.toUpperCase();

			if (consts.TAGS[category]) {
				// Get the tag elements and limit to the first 2
				const tagElements = $(el).next("dd").find("ul.commas > li > a.tag");
				const tagList = tagElements
					.slice(0, 2)
					.map((_, tagEl) => $(tagEl).text().trim())
					.get();
				tags.push({ category, values: tagList });
			}
		});

		const fanfic: Fanfic = {
			id: fanficId,
			sourceUrl: `${consts.AO3_LINK}/works/${fanficId}`,
			title: parseHtml("h2.title.heading"),
			author: parseHtml("a[rel=author]"),
			summary: parseHtml("#workskin div.summary.module blockquote.userstuff"),
			updatedAt: parseToDate("dd.status"),
			completedAt: parseHtml("dt.status").startsWith("Completed")
				? parseToDate("dd.status")
				: undefined,
			authorUrl: authorLink,
			createdAt: parseToDate("dd.published"),
			downloadLinks: downloadLinks,
			downloadedAt: DateTime.now(),
			tags: tags,
		};

		console.log({ fanfic });

		return fanfic;
	} catch (error) {
		console.error("Error fetching or parsing AO3 metadata:", error);
		return null;
	}
}
