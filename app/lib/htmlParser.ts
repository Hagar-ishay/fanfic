import { NewFanfic, Tags } from "@/db/types";
import * as cheerio from "cheerio";
import { convert } from "html-to-text";
import { DateTime } from "luxon";
import * as consts from "../consts";
import logger from "@/logger";

export class Ao3HtmlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Ao3HtmlParseError";
  }
}

export function htmlParser(html: string, externalId: string | number) {
  try {
    const extractor = new HtmlParser(html, externalId);
    return extractor.getObject();
  } catch (error) {
    if (error instanceof Ao3HtmlParseError) {
      throw error;
    }

    logger.error(
      `Error fetching or parsing AO3 metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw new Ao3HtmlParseError(
      "Failed to parse AO3 metadata. Please try again later."
    );
  }
}

class HtmlParser {
  private $: cheerio.CheerioAPI;
  private _externalId: number;

  constructor(html: string, externalId: string | number) {
    this.$ = cheerio.load(html, {
      xml: {
        decodeEntities: false,
      },
    });

    this.cleanHtml(html);
    this._externalId = +externalId;

    if (!this.$("#workskin").length) {
      throw new Ao3HtmlParseError(
        "Unable to load AO3 work details. The work may require you to log in or is not publicly accessible."
      );
    }
  }

  private cleanHtml(text: string): string {
    this.$("#admin-banner").remove();
    return text;
  }

  private parseToString(selector: cheerio.BasicAcceptedElems<any>): string {
    const element = this.$(selector).first();
    if (!element.length) {
      return "";
    }

    const html = element.html() || "";
    const result = convert(html, {
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "img", format: "skip" },
        { selector: "em", format: "italics" },
        {
          selector: "p",
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
      ],
      formatters: {
        italics: (elem, walk, builder) => {
          builder.addInline("_");
          walk(elem.children, builder);
          builder.addInline("_");
        },
      },
      preserveNewlines: true,
      wordwrap: false,
    });

    return result;
  }

  private parseToDate(
    selector: cheerio.BasicAcceptedElems<any>
  ): Date | null {
    const element = this.$(selector).first();
    if (!element.length) {
      return null;
    }

    const candidates = [
      element.text().trim(),
      element.attr("datetime")?.trim(),
    ].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      const isoDate = DateTime.fromISO(candidate, { zone: "utc" });
      if (isoDate.isValid) {
        return isoDate.toJSDate();
      }

      const friendlyDate = DateTime.fromFormat(candidate, "MMM d, yyyy", {
        zone: "utc",
      });
      if (friendlyDate.isValid) {
        return friendlyDate.toJSDate();
      }

      const longDate = DateTime.fromFormat(candidate, "MMMM d, yyyy", {
        zone: "utc",
      });
      if (longDate.isValid) {
        return longDate.toJSDate();
      }
    }

    return null;
  }

  public get externalId(): number {
    return this._externalId;
  }

  public get summary(): string {
    return this.parseToString(
      "#workskin div.summary.module blockquote.userstuff"
    );
  }

  public get downloadLink(): string {
    const link =
      this.$("li.download ul.expandable.secondary > li > a")
        .filter((_, el) => this.$(el).text().trim().toUpperCase() === "EPUB")
        .map((_, el) => `${consts.AO3_LINK}${this.$(el).attr("href") ?? ""}`)
        .get(0) || "";

    if (!link) {
      throw new Ao3HtmlParseError(
        "Unable to find an AO3 download link. The work may require you to log in."
      );
    }

    return link;
  }

  public get authorUrl(): string {
    return `${consts.AO3_LINK}${this.$("a[rel=author]").attr("href") ?? ""}`;
  }

  public get tags(): Tags {
    const tags: Tags = {};
    this.$("dl.work.meta.group > dt").each((_, el) => {
      const category = this.parseToString(el)
        .replace(/\s+/g, " ")
        .replace(":", "")
        .toUpperCase();
      const tagElements = this.$(el).next("dd").find("ul.commas > li > a.tag");
      const tagList = tagElements
        .map((_, tagEl) => this.parseToString(tagEl))
        .get();

      tags[category] = tagList;
    });

    return tags;
  }

  public get language(): string {
    return this.$("dd.language").attr("lang") || "";
  }

  public get wordCount(): number {
    return +this.$("dd.words").text().replace(",", "");
  }

  public get chapterCount(): string {
    return this.parseToString("dd.chapters");
  }

  public get title(): string {
    const title = this.parseToString("h2.title.heading");
    if (!title) {
      throw new Ao3HtmlParseError(
        "Unable to read the work title from AO3. Please verify the link."
      );
    }

    return title;
  }

  public get author(): string {
    const author = this.parseToString("a[rel=author]");
    if (!author) {
      throw new Ao3HtmlParseError(
        "Unable to determine the work author from AO3."
      );
    }

    return author;
  }

  public get updatedAt(): Date {
    const updated = this.parseToDate("dd.status");
    return updated ?? this.createdAt;
  }

  public get completedAt(): Date | null {
    return this.$("dt.status").text().startsWith("Completed")
      ? (() => {
          const completed = this.parseToDate("dd.status");
          if (!completed) {
            throw new Ao3HtmlParseError(
              "AO3 returned an unexpected completion date format."
            );
          }
          return completed;
        })()
      : null;
  }

  public get createdAt(): Date {
    const created = this.parseToDate("dd.published");
    if (!created) {
      throw new Ao3HtmlParseError(
        "Unable to read the publication date. The work may require you to log in."
      );
    }

    return created;
  }

  public get sourceUrl(): string {
    return `${consts.AO3_LINK}/works/${this.externalId}`;
  }

  public getObject(): NewFanfic {
    const metadata: NewFanfic = {
      externalId: this.externalId,
      summary: this.summary,
      downloadLink: this.downloadLink,
      tags: this.tags,
      title: this.title,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      authorUrl: this.authorUrl,
      wordCount: this.wordCount,
      chapterCount: this.chapterCount,
      createdAt: this.createdAt,
      author: this.author,
      sourceUrl: this.sourceUrl,
      language: this.language,
    };

    return metadata;
  }
}
