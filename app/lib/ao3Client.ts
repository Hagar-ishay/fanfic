"use server";

import fs from "node:fs";
import querystring from "querystring";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AO3_LINK } from "@/consts";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar, Cookie } from "tough-cookie";
import { Credentials } from "@/db/types";
import { getCredentials, refreshSession } from "@/db/credentials";
import * as cheerio from "cheerio";

export async function getAo3Client() {
  const credentials = await getCredentials("AO3");
  if (!credentials) {
    throw new Error("No AO3 credentials found");
  }
  const ao3Client = new AO3Client();
  await ao3Client.login(credentials);
  return ao3Client;
}

export type AutoCompleteType =
  | "fandom"
  | "freeform"
  | "relationship"
  | "character";

class AO3Client {
  private cookieJar: CookieJar;
  private axiosInstance: AxiosInstance;
  private defaultHeaders: object = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
    "upgrade-insecure-requests": "1",
  };

  private essentialCookies = [
    "_otwarchive_session",
    "remember_user_token",
    "user_credentials",
    "view_adult",
  ];

  constructor() {
    this.cookieJar = new CookieJar();
    this.axiosInstance = wrapper(
      axios.create({
        jar: this.cookieJar,
        withCredentials: true,
      })
    );
  }

  private setCookies(
    cookies: {
      key: string;
      value: string;
      expires?: Date | null | "Infinity";
    }[]
  ) {
    cookies.map(({ key, value, expires }) => {
      const cookie = new Cookie({
        key,
        value,
        domain: AO3_LINK.replace(/^https?:\/\//, ""),
        expires: expires ? new Date(expires) : undefined,
        httpOnly: true,
        secure: true,
      });
      this.cookieJar.setCookieSync(cookie.cookieString(), AO3_LINK);
    });
  }

  private async setSessionCookies(
    cookies: { key: string; value: string; expires: Date | null | "Infinity" }[]
  ) {
    // Only store essential cookies
    const session = cookies
      .filter((cookie) => this.essentialCookies.includes(cookie.key))
      .map((cookie) => ({
        key: cookie.key,
        value: cookie.value,
        expires: cookie.expires,
      }));

    await refreshSession("AO3", session);
    this.setCookies(session);
  }

  private async request<T>(config: {
    method: string;
    url: string;
    data?: any;
    headers?: any;
    responseType?: "stream";
  }): Promise<T> {
    config.headers = { ...this.defaultHeaders, ...config.headers };
    const cookies = await this.cookieJar.store.getAllCookies();
    console.log(
      "Using cookies:",
      cookies.map((c) => c.key)
    );
    config.headers.Cookie = cookies
      .map((cookie) => cookie.cookieString())
      .join("; ");

    try {
      console.time(`AO3 ${config.method} request to ${config.url}`);
      const response = await this.axiosInstance.request<T>({
        ...config,
      });
      console.timeEnd(`AO3 ${config.method} request to ${config.url}`);
      if (config.responseType === "stream") {
        return response as T;
      }
      return response.data;
    } catch (error) {
      console.timeEnd(`AO3 ${config.method} request to ${config.url}`);
      console.error("Request failed:", error);
      throw error;
    }
  }

  private async getToken(): Promise<string> {
    const tokenUrl = `${AO3_LINK}/token_dispenser.json`;
    try {
      const response = await this.axiosInstance.get(tokenUrl);
      return response.data.token;
    } catch (error) {
      console.error("Failed to get token:", error);
      throw error;
    }
  }

  public async refreshLogin(): Promise<void> {
    console.log("Refreshing AO3 login");
    const loginUrl = `${AO3_LINK}/users/login`;
    try {
      const tokenResponse = await this.getToken();
      const data = {
        authenticity_token: tokenResponse,
        "user[login]": process.env.AO3_USERNAME,
        "user[password]": process.env.AO3_PASSWORD,
        "user[remember_me]": 1,
        commit: "Log in",
      };
      const encodedData = querystring.stringify(data);

      await this.request({
        method: "POST",
        url: loginUrl,
        data: encodedData,
        headers: {
          Referer: `${AO3_LINK}/users/login`,
        },
      });

      const cookies = (await this.cookieJar.store.getAllCookies()).map(
        (cookie) => ({
          key: cookie.key,
          value: cookie.value,
          expires: cookie.expires,
        })
      );

      await this.setSessionCookies(cookies);
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to login: ${error}`);
    }
  }

  public async login(credentials: Credentials): Promise<void> {
    if (credentials.session) {
      await this.setSessionCookies(credentials.session);
    } else {
      await this.refreshLogin();
    }
  }

  public async getFanfic(externalId: string): Promise<string> {
    const url = `${AO3_LINK}/works/${externalId}?view_adult=true`;
    const response = await this.request<string>({
      method: "GET",
      url,
    });
    return response;
  }

  public async autocomplete(
    type: string,
    query: string
  ): Promise<{ id: string; name: string }[]> {
    const url = `${AO3_LINK}/autocomplete/${type}?term=${query}`;
    return this.request({ method: "GET", url });
  }

  public async downloadFanfic(
    url: string,
    downloadPath: string
  ): Promise<void> {
    const response = await this.request<AxiosResponse>({
      method: "GET",
      url,
      responseType: "stream",
    });

    if (!response || !response.data) {
      throw new Error("Failed to fetch fanfic");
    }

    const fileStream = fs.createWriteStream(downloadPath);

    await new Promise<void>((resolve, reject) => {
      (response.data as NodeJS.ReadableStream)
        .pipe(fileStream)
        .on("finish", resolve)
        .on("error", reject);
    });
  }

  public async kudos(externalId: string): Promise<string[]> {
    const url = `${AO3_LINK}/kudos.js`;
    const body = {
      authenticity_token: await this.getToken(),
      "kudo[commentable_id]": externalId,
      "kudo[commentable_type]": "Work",
    };
    return this.request({ method: "POST", url, data: body });
  }

  public async search(params: Record<string, any>): Promise<{
    results: any[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
  }> {
    const searchUrl = new URL(`${AO3_LINK}/works/search`);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchUrl.searchParams.append(`work_search[${key}]`, value.toString());
      }
    }

    console.log({ searchUrl });

    const response = await this.request<string>({
      method: "GET",
      url: searchUrl.toString(),
    });

    // Debug: Log first few lines of response to check if filtering is working
    const lines = response.split('\n').slice(0, 10);
    console.log('AO3 Response preview:', lines);

    const results = this.parseSearchResults(response, params.page || 1);
    console.log(`Found ${results.results.length} results, total: ${results.totalResults}`);
    
    return results;
  }

  private parseSearchResults(
    html: string,
    currentPage: number
  ): {
    results: any[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
  } {
    const $ = cheerio.load(html);

    const results: any[] = [];

    // Parse search results
    $("#main ol.work li.work").each((_, element) => {
      const $work = $(element);

      // Extract work ID from the blurb
      const workId = $work.attr("id")?.replace("work_", "") || "";

      // Extract basic information
      const title = $work.find("h4.heading a:first").text().trim();
      const author = $work.find('h4.heading a[rel="author"]').text().trim();
      const authorUrl = `${AO3_LINK}${$work.find('h4.heading a[rel="author"]').attr("href") || ""}`;

      // Extract summary
      const summary = $work.find("blockquote.userstuff").text().trim();

      // Extract tags
      const tags: { [category: string]: string[] } = {};
      $work.find("ul.tags li").each((_, tagElement) => {
        const $tag = $(tagElement);
        const className = $tag.attr("class") || "";
        const tagText = $tag.find("a").text().trim();

        if (className.includes("fandom")) {
          tags.fandoms = tags.fandoms || [];
          tags.fandoms.push(tagText);
        } else if (className.includes("relationship")) {
          tags.relationships = tags.relationships || [];
          tags.relationships.push(tagText);
        } else if (className.includes("character")) {
          tags.characters = tags.characters || [];
          tags.characters.push(tagText);
        } else if (className.includes("freeform")) {
          tags.additional = tags.additional || [];
          tags.additional.push(tagText);
        }
      });

      // Extract metadata
      const language = $work.find("dd.language").text().trim();
      const wordsText = $work.find("dd.words").text().replace(/,/g, "");
      const words = parseInt(wordsText) || 0;
      const chapters = $work.find("dd.chapters").text().trim();

      // Extract stats
      const kudosText = $work.find("dd.kudos a").text().trim();
      const kudos = parseInt(kudosText) || 0;

      const commentsText = $work.find("dd.comments a").text().trim();
      const comments = parseInt(commentsText) || 0;

      const bookmarksText = $work.find("dd.bookmarks a").text().trim();
      const bookmarks = parseInt(bookmarksText) || 0;

      const hitsText = $work.find("dd.hits").text().trim();
      const hits = parseInt(hitsText) || 0;

      // Extract dates
      const publishedText = $work.find("p.datetime").first().text();
      const updatedText = $work.find("p.datetime").last().text();

      const published = new Date(publishedText);
      const updated = new Date(updatedText);

      // Determine status
      const isComplete = $work.find("span.complete-yes").length > 0;
      const status = isComplete ? "complete" : "in-progress";

      // Extract rating and category
      const rating = $work.find("span.rating").attr("title") || "";
      const category = $work.find("span.category").attr("title") || "";

      const sourceUrl = `${AO3_LINK}/works/${workId}`;

      results.push({
        workId,
        title,
        author,
        authorUrl,
        summary,
        tags,
        rating,
        category,
        status,
        chapters,
        words,
        kudos,
        comments,
        bookmarks,
        hits,
        published,
        updated,
        language,
        sourceUrl,
      });
    });

    // Extract pagination info
    const totalResultsText = $("h2.heading").first().text();
    const totalResultsMatch = totalResultsText.match(/(\d+)/);
    const totalResults = totalResultsMatch
      ? parseInt(totalResultsMatch[1])
      : results.length;

    const totalPages = Math.ceil(totalResults / 20); // AO3 shows 20 results per page

    return {
      results,
      totalPages,
      currentPage,
      totalResults,
    };
  }
}
