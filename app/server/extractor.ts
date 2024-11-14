import * as consts from "@/consts";
import type { Fanfic, Tags } from "@/db/types";
import * as cheerio from "cheerio";
import { DateTime } from "luxon";

export async function fanficExtractor(data: string, fanficId: string) {
	try {
		const $ = cheerio.load(data);
		$("#admin-banner").remove();

		const parseHtml = (selector: string): string => {
			return $(selector).first().text().trim();
		};

		const parseToDate = (selector: string): Date => {
			return DateTime.fromISO($(selector).text().trim()).toJSDate();
		};

		const summaryElement = $(
			"#workskin div.summary.module blockquote.userstuff",
		).first();

		const summary =
			summaryElement && summaryElement.length > 0
				? summaryElement
						.html()
						?.replace(/<\/p><p>/g, "\n")
						.replace(/<[^>]+>/g, "\n")
						.trim()
				: "";

		const downloadLink =
			$("li.download ul.expandable.secondary > li > a")
				.filter((_, el) => $(el).text().trim().toUpperCase() === "EPUB")
				.map((_, el) => `${consts.AO3_LINK}${$(el).attr("href") ?? ""}`)
				.get(0) || "";

		const authorLink = `${consts.AO3_LINK}${$("a[rel=author]").attr("href") ?? ""}`;

		const tags: Tags = {};
		$("dl.work.meta.group > dt").each((_, el) => {
			const category = $(el)
				.text()
				.trim()
				.replace(/\s+/g, " ")
				.replace(":", "")
				.toUpperCase() as keyof typeof consts.TAGS;

			if (consts.TAGS[category]) {
				const tagElements = $(el).next("dd").find("ul.commas > li > a.tag");
				const tagList = tagElements
					.slice(0, 2)
					.map((_, tagEl) => $(tagEl).text().trim())
					.get();

				if (category === consts.TAGS.RATING) {
					const rating = tagList[0];
					if (rating !== "Not Rated") {
						tags[category] = [rating[0].toUpperCase()];
					}
				} else {
					tags[category] = tagList;
				}
			}
		});

		const fanfic = {
			fanficId: +fanficId,
			sourceUrl: `${consts.AO3_LINK}/works/${fanficId}`,
			title: parseHtml("h2.title.heading"),
			author: parseHtml("a[rel=author]"),
			summary: summary || null,
			updatedAt: parseToDate("dd.status"),
			completedAt: parseHtml("dt.status").startsWith("Completed")
				? parseToDate("dd.status")
				: null,
			authorUrl: authorLink,
			createdAt: parseToDate("dd.published"),
			downloadLink: downloadLink,
			tags: tags,
			wordCount: +parseHtml("dd.words").replace(",", ""),
			chapterCount: parseHtml("dd.chapters"),
			language: $("dd.language").attr("lang"),
		};

		return fanfic;
	} catch (error) {
		console.error("Error fetching or parsing AO3 metadata:", error);
		return null;
	}
}
