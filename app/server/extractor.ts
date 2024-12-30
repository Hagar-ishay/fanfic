"use server";
import * as cheerio from "cheerio";
import { DateTime } from "luxon";
import * as consts from "../consts";
import { NewFanfic, Tags } from "@/db/types";

export async function extractFanfic(html: string, fanficId: string | number) {
  const extractor = new Extractor(html, fanficId);
  const parsedFanfic = extractor.getObject();
  return parsedFanfic;
}

class Extractor {
  private $: cheerio.CheerioAPI;
  private _fanficId: number;

  constructor(html: string, fanficId: string | number) {
    this.$ = cheerio.load(html);
    this.cleanHtml(html);
    this._fanficId = +fanficId;
  }

  private cleanHtml(text: string): string {
    this.$("#admin-banner").remove();

    return text.replace(/\s+/g, " ").trim();
  }

  private parseToString(selector: cheerio.BasicAcceptedElems<any>): string {
    return this.$(selector).first().text().trim();
  }

  private parseToDate(selector: cheerio.BasicAcceptedElems<any>): Date {
    return DateTime.fromISO(this.$(selector).text().trim()).toJSDate();
  }

  public get fanficId(): number {
    return this._fanficId;
  }

  public get summary(): string {
    return (
      this.$("#workskin div.summary.module blockquote.userstuff")
        .first()
        .html()
        ?.replace(/<\/p><p>/g, "\n")
        .replace(/<[^>]+>/g, "\n")
        .trim() || ""
    );
  }

  public get downloadLink(): string {
    return (
      this.$("#workskin div.summary.module blockquote.userstuff")
        .filter((_, el) => this.$(el).text().trim().toUpperCase() === "EPUB")
        .map((_, el) => `${consts.AO3_LINK}${this.$(el).attr("href") ?? ""}`)
        .get(0) || ""
    );
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
    return this.parseToString("h2.title.heading");
  }

  public get author(): string {
    return this.parseToString("a[rel=author]");
  }

  public get updatedAt(): Date {
    const updated = this.parseToDate("dd.status");
    return isNaN(updated.getTime()) ? this.createdAt : updated;
  }

  public get completedAt(): Date | null {
    return this.$("dt.status").text().startsWith("Completed")
      ? this.parseToDate("dd.status")
      : null;
  }

  public get createdAt(): Date {
    return this.parseToDate("dd.published");
  }

  public get sourceUrl(): string {
    return `${consts.AO3_LINK}/works/${this.fanficId}`;
  }

  public getObject(): NewFanfic | null {
    try {
      return {
        fanficId: this.fanficId,
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
      };
    } catch (error) {
      console.error("Error fetching or parsing AO3 metadata:", error);
      return null;
    }
  }
}
