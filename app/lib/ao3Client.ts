"use server";

import fs from "node:fs";
import querystring from "querystring";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AO3_LINK } from "@/consts";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar, Cookie } from "tough-cookie";
import { Credentials } from "@/db/types";
import { ENV } from "@/config";
import { getCredentials, refreshSession } from "@/db/credentials";

export async function getAo3Client() {
  const credentials = await getCredentials("AO3");
  if (!credentials) {
    throw new Error("No AO3 credentials found");
  }
  const ao3Client = new AO3Client();
  await ao3Client.login(credentials);
  return ao3Client;
}

export type AutoCompleteType = "fandom" | "freeform" | "relationship" | "character";

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

  private essentialCookies = ["_otwarchive_session", "remember_user_token", "user_credentials", "view_adult"];

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

  private async setSessionCookies(cookies: { key: string; value: string; expires: Date | null | "Infinity" }[]) {
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
    config.headers.Cookie = cookies.map((cookie) => cookie.cookieString()).join("; ");

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
        "user[login]": ENV.AO3_USERNAME,
        "user[password]": ENV.AO3_PASSWORD,
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

      const cookies = (await this.cookieJar.store.getAllCookies()).map((cookie) => ({
        key: cookie.key,
        value: cookie.value,
        expires: cookie.expires,
      }));

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

  public async autocomplete(type: string, query: string): Promise<{ id: string; name: string }[]> {
    const url = `${AO3_LINK}/autocomplete/${type}?term=${query}`;
    return this.request({ method: "GET", url });
  }

  public async downloadFanfic(url: string, downloadPath: string): Promise<void> {
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
      (response.data as NodeJS.ReadableStream).pipe(fileStream).on("finish", resolve).on("error", reject);
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
}
